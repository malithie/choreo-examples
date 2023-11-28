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
    resource function get org/[string orgId]/personalization(http:Headers headers) returns Personalization|http:NotFound|error? {

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

    @http:ResourceConfig {
        auth: {
            scopes: "update_personalization"
        }
    }
    resource function delete org/[string orgId]/personalization(http:Headers headers) returns http:NoContent|http:NotFound|error? {

        string|()|error result = deletePersonalization(orgId);
        if result is () {
            return http:NOT_FOUND;
        } else if result is error {
            return result;
        }
        return http:NO_CONTENT;
    }

}