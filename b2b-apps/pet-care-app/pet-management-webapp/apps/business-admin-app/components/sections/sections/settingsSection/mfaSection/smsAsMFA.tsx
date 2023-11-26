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
import { SMS, SMS_OTP_AUTHENTICATOR, checkIfJSONisEmpty } from "@pet-management-webapp/shared/util/util-common";
import { Session } from "next-auth";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Panel, Stack } from "rsuite";
import ConfirmMFAAddRemoveModal from "./confirmMFAAddRemoveModal";
import { getImageForMFAProvider } from "./mfaProviderUtils";
import { Form } from "react-final-form";
import FormSuite from "rsuite/Form";
import { FormField, FormButtonToolbar } from "@pet-management-webapp/shared/ui/ui-basic-components";
import styles from "../../../../../styles/Settings.module.css";
import { LOADING_DISPLAY_BLOCK, LOADING_DISPLAY_NONE, fieldValidate } from "@pet-management-webapp/shared/util/util-front-end-util";

interface SmsAsMFAProps {
    session: Session,
    id: string
}


export default function SmsAsMFA(props: SmsAsMFAProps) {

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
            const check = checkIfAuthenticatorIsinAuthSequence(applicationDetail, SMS_OTP_AUTHENTICATOR);

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

        errors = fieldValidate("sms_provider_name", values.name, errors);
        errors = fieldValidate("sms_provider_url", values.description, errors);
        errors = fieldValidate("sms_provider_auth_key", values.name, errors);
        errors = fieldValidate("sms_provider_auth_secret", values.description, errors);
        errors = fieldValidate("sender", values.description, errors);
        errors = fieldValidate("content_type", values.name, errors);
        errors = fieldValidate("headers", values.description, errors);
        errors = fieldValidate("http_method", values.description, errors);
        errors = fieldValidate("payload", values.description, errors);

        return errors;
    };

    return (

        <Panel
            header={
                (<AccordianItemHeaderComponent
                    imageSrc={ getImageForMFAProvider(SMS) }
                    title={ "SMS OTP" }
                    description={ "Configure SMS as multi-factor authentication." } />)
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
                            authenticator={ SMS_OTP_AUTHENTICATOR } />
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
                                    name="sms_provider_name"
                                    label="SMS Provider Name"
                                    helperText={ 
                                        "The name of the SMS provider." 
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="sms_provider_url"
                                    label="SMS Provider URL"
                                    needErrorMessage={ true }
                                    helperText="The URL of the SMS provider."
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="sms_provider_auth_key"
                                    label="SMS Provider Auth Key"
                                    helperText={
                                        "The auth key of the SMS provider."
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" type="password" />
                                </FormField>

                                <FormField
                                    name="sms_provider_auth_secret"
                                    label="SMS Provider Auth Secret"
                                    helperText={
                                        "The auth secret of the SMS provider."
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="sender"
                                    label="Sender"
                                    helperText={
                                        "The sender of the SMS."
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="content_type"
                                    label="Content Type"
                                    helperText={
                                        "The content type of the API request used for sending the SMS."
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="headers"
                                    label="Headers"
                                    helperText={
                                        "Headers to be included in the send SMS API request."
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="http_method"
                                    label="HTTP Method"
                                    helperText={
                                        "The HTTP method of the API request used for sending the SMS."
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
                                </FormField>

                                <FormField
                                    name="payload"
                                    label="Payload"
                                    helperText={
                                        "Payload of the SMS API request."
                                    }
                                    needErrorMessage={ true }
                                >
                                    <FormSuite.Control name="input" />
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
