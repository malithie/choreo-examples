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

import { BookingInfo } from "apps/business-admin-app/types/booking";
import createHeaders from "../createHeaders";
import { getDoctorInstance } from "../getDoctors/doctorInstance";

export async function updateBooking(accessToken: string, orgId: string, bookingId: string, payload?: BookingInfo) {
    console.log("bookingId", bookingId);
    const headers = createHeaders(accessToken);
    const path = `/org/${orgId}/bookings/` + bookingId;
    const response = await getDoctorInstance().put(path, payload, {
        headers: headers
    });

    console.log("6 response", response);
    return response;

}
