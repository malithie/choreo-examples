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
    Application, ApplicationList, IdentityProvider, checkIfAuthenticatorIsinAuthSequence 
} from "@pet-management-webapp/business-admin-app/data-access/data-access-common-models-util";
import { 
    controllerDecodeGetApplication, controllerDecodeListCurrentApplication, controllerDecodePatchGeneralSettingsIdp 
} from "@pet-management-webapp/business-admin-app/data-access/data-access-controller";
import { AccordianItemHeaderComponent, errorTypeDialog, successTypeDialog } from "@pet-management-webapp/shared/ui/ui-components";
import { EMAIL, EMAIL_OTP_AUTHENTICATOR, checkIfJSONisEmpty } from "@pet-management-webapp/shared/util/util-common";
import { Session } from "next-auth";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Panel, Stack, toaster } from "rsuite";
import ConfirmMFAAddRemoveModal from "./confirmMFAAddRemoveModal";
import { getImageForMFAProvider } from "./mfaProviderUtils";
import FormSuite from "rsuite/Form";
import { FormField, FormButtonToolbar } from "@pet-management-webapp/shared/ui/ui-basic-components";
import { LOADING_DISPLAY_BLOCK, LOADING_DISPLAY_NONE, fieldValidate } from "@pet-management-webapp/shared/util/util-front-end-util";
import styles from "../../../../../styles/Settings.module.css";
import { Form } from "react-final-form";

interface EmailAsMFAProps {
    session: Session,
    id: string
}

/**
 * 
 * @param prop - session, id (idp id), fetchAllIdPs (function to fetch all Idps)
 * 
 * @returns idp item details component
 */
export default function EmailAsMFA(props: EmailAsMFAProps) {

    const { session } = props;

    const [ loadingDisplay, setLoadingDisplay ] = useState(LOADING_DISPLAY_NONE);
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
            const check = checkIfAuthenticatorIsinAuthSequence(applicationDetail, EMAIL_OTP_AUTHENTICATOR);

            setIdpIsinAuthSequence(check[0]);
        }
    }, [ applicationDetail ]);

    const onAddToLoginFlowClick = (): void => {
        setOpenListAppicationModal(true);
    };

    const onCloseListAllApplicaitonModal = (): void => {
        setOpenListAppicationModal(false);
    };

    const onUpdate = (values: Record<string, string>, form): void => {
        setLoadingDisplay(LOADING_DISPLAY_BLOCK);
    };

    const validate = (values: Record<string, unknown>): Record<string, string> => {
        let errors: Record<string, string> = {};

        errors = fieldValidate("server_host", values.name, errors);
        errors = fieldValidate("server_port", values.description, errors);
        errors = fieldValidate("from_address", values.name, errors);
        errors = fieldValidate("reply_to_address", values.description, errors);
        errors = fieldValidate("username", values.description, errors);
        errors = fieldValidate("password", values.name, errors);
        errors = fieldValidate("display_name", values.description, errors);

        return errors;
    };

    return (

        <Panel
            header={
                (<AccordianItemHeaderComponent
                    imageSrc={ getImageForMFAProvider(EMAIL) }
                    title={ "Email OTP" }
                    description={ "Configure Email as multi-factor authentication." } />)
            }
            eventKey={ EMAIL }
            id={ EMAIL }
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
                            authenticator={ EMAIL_OTP_AUTHENTICATOR } />
                    </Stack>
                    <Form
                        onSubmit={ onUpdate }
                        validate={ validate }
                        render={ ({ handleSubmit, form, submitting, pristine, errors }) => (
                            <FormSuite
                                layout="vertical"
                                className={ styles.addUserForm }
                                onSubmit={ () => { handleSubmit().then(form.restart); } }
                                fluid>

                                <FormField
                                    name="server_host"
                                    label="Server Host"
                                    helperText={ 
                                        "The Server Host usually begins with smtp, " +
                                        "followed by the domain name of the email service provider." 
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="server_port"
                                    label="Server Port"
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="from_address"
                                    label="From Address"
                                    helperText={
                                        "The From Address is the email address you want to " + 
                                        "appear as the sender of your outgoing emails."
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="reply_to_address"
                                    label="Reply-to Address"
                                    helperText={
                                        "The Reply-To Address is used to specify the email address that " + 
                                        "recipients should use if they want to reply to your message."
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="username"
                                    label="Username"
                                    helperText={
                                        "The SMTP username is usually the same as your email address."
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="password"
                                    label="Password"
                                    helperText={
                                        "The SMTP password is a security credential that is used to authenticate " + 
                                        "and verify your identity when sending emails through the SMTP server."
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" type="password" />
                                </FormField>

                                <FormField
                                    name="display_name"
                                    label="Display Name"
                                    helperText={
                                        "The Display Name is used to specify the name that recipients will " + 
                                        "see in their email inbox when they receive your message."
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" type="password" />
                                </FormField>

                                <FormButtonToolbar
                                    submitButtonText="Update"
                                    submitButtonDisabled={ submitting || pristine || !checkIfJSONisEmpty(errors) }
                                    needCancel={ false }
                                />

                            </FormSuite>
                        ) }
                    />
                </Stack>
            </div>
        </Panel>
    );
}
