import ballerina/http;
table<Personalization> key(org) personalizationRecords = table [];

function getPersonalization(string org) returns Personalization|error|http:NotFound {

    Personalization? personalization = personalizationRecords[org];
    if personalization is () {
        return http:NOT_FOUND;
    }
    return personalization;
}

function updatePersonalization(string org, Personalization personalization) returns Personalization|error {

    Personalization? oldPersonalizationRecord = personalizationRecords[org];
    if oldPersonalizationRecord !is () {
        _ = personalizationRecords.remove(org);
    }
    personalizationRecords.put({
        ...personalization
    });
    return personalization;
}

function deletePersonalization(string org) returns string|()|error {

    Personalization? oldPersonalizationRecord = personalizationRecords[org];
    if oldPersonalizationRecord !is () {
        _ = personalizationRecords.remove(org);
    }

    return "Deleted successfully";
}
