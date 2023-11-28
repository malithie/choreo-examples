table<Personalization> key(org) personalizationRecords = table [];

function getPersonalization(string org) returns Personalization|error {

    Personalization? personalization = personalizationRecords[org];
    if personalization is () {
        Personalization defaultPersonalization = {
            org: "",
            logoUrl: "https://user-images.githubusercontent.com/35829027/241967420-9358bd5c-636e-48a1-a2d8-27b2aa310ebf.png",
            logoAltText: "Pet Care App Logo",
            faviconUrl: "https://user-images.githubusercontent.com/1329596/242288450-b511d3dd-5e02-434f-9924-3399990fa011.png",
            primaryColor: "#4F40EE",
            secondaryColor: "#E0E1E2"
        };
        return defaultPersonalization;
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
