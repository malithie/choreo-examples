/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { 
    Application, ApplicationList, checkIfAuthenticatorIsinAuthSequence 
} from "@pet-management-webapp/business-admin-app/data-access/data-access-common-models-util";
import { 
    controllerDecodeGetApplication, controllerDecodeListCurrentApplication 
} from "@pet-management-webapp/business-admin-app/data-access/data-access-controller";
import { AccordianItemHeaderComponent } from "@pet-management-webapp/shared/ui/ui-components";
import { TOTP, TOTP_OTP_AUTHENTICATOR, checkIfJSONisEmpty } from "@pet-management-webapp/shared/util/util-common";
import { Session } from "next-auth";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Panel, Stack } from "rsuite";
import ConfirmMFAAddRemoveModal from "./confirmMFAAddRemoveModal";
import { getImageForMFAProvider } from "./mfaProviderUtils";

interface TotpAsMFAProps {
    session: Session,
    id: string
}


export default function TotpAsMFA(props: TotpAsMFAProps) {

    const { session } = props;

    const [ allApplications, setAllApplications ] = useState<ApplicationList>(null);
    const [ applicationDetail, setApplicationDetail ] = useState<Application>(null);
    const [ idpIsinAuthSequence, setIdpIsinAuthSequence ] = useState<boolean>(null);
    const [ openListAppicationModal, setOpenListAppicationModal ] = useState<boolean>(false);

    const fetchData = useCallback(async () => {
        const res : ApplicationList = ( await controllerDecodeListCurrentApplication(session) as ApplicationList );
        
        await setAllApplications(res);
    }, [ session, openListAppicationModal ]);

    const fetchApplicatioDetails = useCallback(async () => {
        if (!checkIfJSONisEmpty(allApplications) && allApplications.totalResults !== 0) {
            const res : Application = ( 
                await controllerDecodeGetApplication(session, allApplications.applications[0].id) as Application );
                      
            await setApplicationDetail(res);
        }
    }, [ session, allApplications ]);

    useEffect(() => {
        fetchData();
    }, [ fetchData ]);

    useEffect(() => {
        fetchApplicatioDetails();
    }, [ fetchApplicatioDetails ]);

    useEffect(() => {
        if (!checkIfJSONisEmpty(applicationDetail)) {
            const check = checkIfAuthenticatorIsinAuthSequence(applicationDetail, TOTP_OTP_AUTHENTICATOR);

            setIdpIsinAuthSequence(check[0]);
        }
    }, [ applicationDetail ]);

    const onAddToLoginFlowClick = (): void => {
        setOpenListAppicationModal(true);
    };

    const onCloseListAllApplicaitonModal = (): void => {
        setOpenListAppicationModal(false);
    };

    return (

        <Panel
            header={
                (<AccordianItemHeaderComponent
                    imageSrc={ getImageForMFAProvider(TOTP) }
                    title={ "TOTP" }
                    description={ "Configure TOTP as multi-factor authentication." } />)
            }
        >
            <div style={ { marginLeft: "25px", marginRight: "25px" } }>
                <Stack direction="column" alignItems="stretch">
                    <Stack justifyContent="flex-end" alignItems="stretch">
                        {
                            idpIsinAuthSequence === null
                                ? null
                                : idpIsinAuthSequence
                                    ? <Button onClick={ onAddToLoginFlowClick }>Remove from Login Flow</Button>
                                    : <Button onClick={ onAddToLoginFlowClick }>Add to the Login Flow</Button>
                        }
                        <ConfirmMFAAddRemoveModal
                            session={ session }
                            openModal={ openListAppicationModal }
                            onModalClose={ onCloseListAllApplicaitonModal }
                            applicationDetail={ applicationDetail }
                            idpIsinAuthSequence={ idpIsinAuthSequence } 
                            authenticator={ TOTP_OTP_AUTHENTICATOR } />
                    </Stack>
                </Stack>
            </div>
        </Panel>
    );
}
