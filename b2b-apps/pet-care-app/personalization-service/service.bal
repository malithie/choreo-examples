import ballerina/http;

public type UserInfo record {|
    string organization;
    string userId;
    string emailAddress?;
    string[] groups?;
|};

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}
service / on new http:Listener(9093) {

    @http:ResourceConfig {
        auth: {
            scopes: "view_personalization"
        }
    }
    resource function get org/[string orgId]/personalization(http:Headers headers) returns Personalization|error? {

        return getPersonalization(orgId);
    }

    @http:ResourceConfig {
        auth: {
            scopes: "update_personalization"
        }
    }
    resource function post org/[string orgId]/personalization(http:Headers headers, @http:Payload Personalization newPersonalization) returns Personalization|error? {

        Personalization|error personalization = updatePersonalization(orgId, newPersonalization);
        return personalization;
    }

}