/* eslint-disable */
export default async () => {
    const t = {
        ["./models/user.entity"]: await import("./models/user.entity"),
        ["./models/renting/expense.entity"]: await import("./models/renting/expense.entity"),
        ["./models/appointment.entity"]: await import("./models/appointment.entity"),
        ["./models/renting/apartment.entity"]: await import("./models/renting/apartment.entity"),
        ["./models/renting/car.entity"]: await import("./models/renting/car.entity"),
        ["./models/renting/client.entity"]: await import("./models/renting/client.entity"),
        ["./models/image.entity"]: await import("./models/image.entity"),
        ["./modules/security/auth/auth.dto"]: await import("./modules/security/auth/auth.dto"),
        ["./modules/security/user/user.dto"]: await import("./modules/security/user/user.dto"),
        ["./models/agency-procedure.entity"]: await import("./models/agency-procedure.entity"),
        ["./models/renting/apartment-rent.entity"]: await import("./models/renting/apartment-rent.entity"),
        ["./models/renting/car-rent.entity"]: await import("./models/renting/car-rent.entity")
    };
    return { "@nestjs/swagger": { "models": [[import("./modules/security/user/user.dto"), { "CreateUserDto": { fullName: { required: true, type: () => String, minLength: 2, maxLength: 30 }, email: { required: true, type: () => String }, password: { required: true, type: () => String, minLength: 6, maxLength: 30, pattern: "atLeastOneCapitalLetter" }, type: { required: true, type: () => Object } }, "UpdateUserDto": { id: { required: true, type: () => String }, fullName: { required: false, type: () => String, minLength: 2, maxLength: 30 }, email: { required: false, type: () => String }, type: { required: false, type: () => Object }, password: { required: false, type: () => String, minLength: 6, maxLength: 30, pattern: "atLeastOneCapitalLetter" } }, "UserPreferencesDto": { preferredCity: { required: false, type: () => String }, maxBudget: { required: false, type: () => Number }, smoking: { required: false, type: () => Boolean }, pets: { required: false, type: () => Boolean }, noiseTolerance: { required: false, type: () => Number }, preferredLanguage: { required: false, type: () => String }, gender: { required: false, type: () => String }, genderPreference: { required: false, type: () => String } }, "UpdateMyProfileDto": { fullName: { required: true, type: () => String, minLength: 2, maxLength: 30 }, email: { required: true, type: () => String } }, "UserResponseDto": { id: { required: true, type: () => String }, fullName: { required: true, type: () => String }, email: { required: true, type: () => String } } }], [import("./models/base-model.entity"), { "BaseModel": { id: { required: true, type: () => String }, deletedAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date }, createdAt: { required: true, type: () => Date } } }], [import("./models/renting/car.entity"), { "Car": { make: { required: true, type: () => String }, model: { required: true, type: () => String }, color: { required: true, type: () => String }, licensePlate: { required: false, type: () => String }, yearOfManufacturing: { required: true, type: () => Number }, owner: { required: true, type: () => t["./models/user.entity"].User }, expenses: { required: true, type: () => [t["./models/renting/expense.entity"].Expense] }, appointments: { required: true, type: () => [t["./models/appointment.entity"].Appointment] } } }], [import("./models/renting/expense.entity"), { "Expense": { description: { required: true, type: () => String }, date: { required: true, type: () => Date }, cost: { required: true, type: () => Number }, apartment: { required: true, type: () => t["./models/renting/apartment.entity"].Apartment }, car: { required: true, type: () => t["./models/renting/car.entity"].Car }, type: { required: true, type: () => Object } } }], [import("./models/renting/apartment.entity"), { "Apartment": { city: { required: true, type: () => String }, fullAddress: { required: true, type: () => String }, owner: { required: true, type: () => t["./models/user.entity"].User }, expenses: { required: true, type: () => [t["./models/renting/expense.entity"].Expense] }, appointments: { required: true, type: () => [t["./models/appointment.entity"].Appointment] } } }], [import("./models/appointment.entity"), { "Appointment": { startTime: { required: true, type: () => Date }, endTime: { required: true, type: () => Date }, status: { required: true, type: () => Object }, apartment: { required: true, type: () => t["./models/renting/apartment.entity"].Apartment }, car: { required: true, type: () => t["./models/renting/car.entity"].Car }, user: { required: true, type: () => t["./models/user.entity"].User }, owner: { required: true, type: () => t["./models/user.entity"].User } } }], [import("./models/user.entity"), { "User": { fullName: { required: true, type: () => String }, email: { required: true, type: () => String }, phone: { required: true, type: () => String }, type: { required: true, type: () => Object }, password: { required: true, type: () => String }, lastForcedLogout: { required: true, type: () => Date }, apartments: { required: true, type: () => [t["./models/renting/apartment.entity"].Apartment] }, cars: { required: true, type: () => [t["./models/renting/car.entity"].Car] }, appointments: { required: true, type: () => [t["./models/appointment.entity"].Appointment] }, ownedAppointments: { required: true, type: () => [t["./models/appointment.entity"].Appointment] }, preferences: { required: true, type: () => ({ preferredCity: { required: false, type: () => String }, maxBudget: { required: false, type: () => Number }, smoking: { required: false, type: () => Boolean }, pets: { required: false, type: () => Boolean }, noiseTolerance: { required: false, type: () => Number }, preferredLanguage: { required: false, type: () => String }, gender: { required: false, type: () => String }, genderPreference: { required: false, type: () => String } }) } } }], [import("./modules/security/auth/auth.dto"), { "LoginDto": { email: { required: true, type: () => String }, password: { required: true, type: () => String, minLength: 6, maxLength: 30 } }, "UpdatePasswordDto": { currentPassword: { required: true, type: () => String, minLength: 6, maxLength: 30 }, newPassword: { required: true, type: () => String, minLength: 6, maxLength: 30 }, repeatNewPassword: { required: true, type: () => String } }, "ILoginCredentialsDto": { user: { required: true, type: () => t["./models/user.entity"].User }, token: { required: true, type: () => String } } }], [import("./models/log.entity"), { "Log": { resource: { required: true, type: () => String }, resourceId: { required: true, type: () => String }, action: { required: true, type: () => String }, data: { required: true, type: () => String }, executingUser: { required: true, type: () => t["./models/user.entity"].User } } }], [import("./modules/security/log/log.dto"), { "CreateLogDto": { resource: { required: true, type: () => String }, resourceId: { required: true, type: () => String }, action: { required: true, type: () => String }, executingUser: { required: true, type: () => t["./models/user.entity"].User } } }], [import("./helpers/helper.dto"), { "IdRequired": { id: { required: true, type: () => String } }, "IdOptional": { id: { required: true, type: () => String } } }], [import("./models/banned-token.entity"), { "BannedToken": { token: { required: true, type: () => String }, type: { required: true, type: () => String } } }], [import("./models/renting/client.entity"), { "Client": { fullName: { required: true, type: () => String }, fullAddress: { required: false, type: () => String }, email: { required: false, type: () => String }, phoneNumber: { required: false, type: () => String }, gender: { required: false, type: () => Object } } }], [import("./modules/agency-procedure/agency-procedure.dto"), { "CreateAgencyProcedureDto": { cost: { required: true, type: () => Number }, date: { required: true, type: () => Date }, description: { required: true, type: () => String }, clientId: { required: false, type: () => String } }, "UpdateAgencyProcedureDto": { id: { required: true, type: () => String }, cost: { required: false, type: () => Number }, date: { required: false, type: () => Date }, description: { required: false, type: () => String }, clientId: { required: false, type: () => String } } }], [import("./models/agency-procedure.entity"), { "AgencyProcedure": { description: { required: true, type: () => String }, cost: { required: true, type: () => Number }, date: { required: true, type: () => Date }, clientId: { required: false, type: () => String }, client: { required: false, type: () => t["./models/renting/client.entity"].Client } } }], [import("./modules/client/client.dto"), { "CreateClientDto": { fullName: { required: true, type: () => String }, fullAddress: { required: false, type: () => String }, phoneNumber: { required: false, type: () => String }, email: { required: false, type: () => String }, gender: { required: false, type: () => Object } }, "UpdateClientDto": { id: { required: true, type: () => String }, fullName: { required: true, type: () => String }, fullAddress: { required: false, type: () => String }, phoneNumber: { required: false, type: () => String }, email: { required: false, type: () => String } } }], [import("./modules/apartment/apartment.dto"), { "CreateApartmentDto": { city: { required: true, type: () => String }, fullAddress: { required: true, type: () => String } }, "UpdateApartmentDto": { id: { required: true, type: () => String }, city: { required: false, type: () => String }, fullAddress: { required: false, type: () => String } } }], [import("./models/renting/apartment-rent.entity"), { "ApartmentRent": { cost: { required: true, type: () => Number }, startedAt: { required: true, type: () => Date }, endedAt: { required: true, type: () => Date }, apartment: { required: true, type: () => t["./models/renting/apartment.entity"].Apartment }, client: { required: false, type: () => t["./models/renting/client.entity"].Client } } }], [import("./modules/apartment-rent/apartment-rent.dto"), { "CreateApartmentRentDto": { cost: { required: true, type: () => Number }, startedAt: { required: true, type: () => Date }, endedAt: { required: true, type: () => Date }, apartmentId: { required: true, type: () => String }, clientId: { required: true, type: () => String } }, "UpdateApartmentRentDto": { id: { required: true, type: () => String }, cost: { required: true, type: () => Number }, startedAt: { required: false, type: () => Date }, endedAt: { required: false, type: () => Date }, clientId: { required: false, type: () => String } } }], [import("./modules/car/car.dto"), { "CreateCarDto": { make: { required: true, type: () => String }, model: { required: true, type: () => String }, color: { required: true, type: () => String }, yearOfManufacturing: { required: true, type: () => Number }, licensePlate: { required: false, type: () => String } }, "UpdateCarDto": { id: { required: true, type: () => String }, make: { required: false, type: () => String }, model: { required: false, type: () => String }, color: { required: false, type: () => String }, licensePlate: { required: false, type: () => String }, yearOfManufacturing: { required: false, type: () => Number } } }], [import("./models/renting/car-rent.entity"), { "CarRent": { cost: { required: true, type: () => Number }, startedAt: { required: true, type: () => Date }, endedAt: { required: true, type: () => Date }, car: { required: true, type: () => t["./models/renting/car.entity"].Car }, client: { required: false, type: () => t["./models/renting/client.entity"].Client } } }], [import("./models/renting/car-audit.entity"), { "CarAudit": { user: { required: true, type: () => t["./models/user.entity"].User }, car: { required: true, type: () => t["./models/renting/car.entity"].Car }, action: { required: true, type: () => String }, changes: { required: true, type: () => ({ old: { required: true, type: () => Object }, new: { required: true, type: () => Object } }) }, timestamp: { required: true, type: () => Date } } }], [import("./modules/car-rent/car-rent.dto"), { "CreateCarRentDto": { cost: { required: true, type: () => Number }, startedAt: { required: true, type: () => Date }, endedAt: { required: true, type: () => Date }, carId: { required: true, type: () => String }, clientId: { required: true, type: () => String } }, "UpdateCarRentDto": { id: { required: true, type: () => String }, cost: { required: true, type: () => Number }, startedAt: { required: false, type: () => Date }, endedAt: { required: false, type: () => Date }, clientId: { required: false, type: () => String } } }], [import("./modules/expense/expense.dto"), { "CreateExpenseDto": { cost: { required: true, type: () => Number }, date: { required: true, type: () => Date }, description: { required: true, type: () => String }, type: { required: true, type: () => Object }, apartmentId: { required: true, type: () => String }, carId: { required: true, type: () => String } }, "UpdateExpenseDto": { id: { required: true, type: () => String }, cost: { required: true, type: () => Number }, date: { required: false, type: () => Date }, description: { required: false, type: () => String }, apartmentId: { required: false, type: () => String }, carId: { required: false, type: () => String } } }], [import("./modules/appointment/appointment.dto"), { "CreateAppointmentDto": { startTime: { required: true, type: () => Date }, apartmentId: { required: false, type: () => String }, carId: { required: false, type: () => String }, userId: { required: false, type: () => String }, ownerId: { required: false, type: () => String } }, "UpdateAppointmentStatusDto": { id: { required: true, type: () => String }, status: { required: true, type: () => Object } } }], [import("./models/image.entity"), { "Image": { key: { required: true, type: () => String }, order: { required: true, type: () => Number }, url: { required: true, type: () => String }, date: { required: true, type: () => Date } } }], [import("./models/agency-car.entity"), { "AgencyCar": { make: { required: true, type: () => String }, model: { required: true, type: () => String }, color: { required: true, type: () => String }, year: { required: true, type: () => Number }, price: { required: true, type: () => Number }, currency: { required: true, type: () => String }, condition: { required: true, type: () => String }, fuel: { required: true, type: () => String }, transmision: { required: false, type: () => String }, km: { required: true, type: () => Number }, videoUrl: { required: false, type: () => String }, images: { required: true, type: () => [t["./models/image.entity"].Image] } } }], [import("./models/error.entity"), { "UnhandledErrorData": { id: { required: true, type: () => String }, data: { required: true, type: () => String }, createdAt: { required: true, type: () => Date } } }]], "controllers": [[import("./modules/security/auth/auth.controller"), { "AuthController": { "login": { type: t["./modules/security/auth/auth.dto"].ILoginCredentialsDto }, "updatePassword": {} } }], [import("./modules/security/user/user.controller"), { "UserController": { "create": { type: t["./modules/security/user/user.dto"].UserResponseDto }, "signup": { type: t["./modules/security/user/user.dto"].UserResponseDto }, "update": {}, "get": { type: t["./modules/security/user/user.dto"].UserResponseDto }, "getAll": {}, "getPotentialRoommates": { type: [t["./modules/security/user/user.dto"].UserResponseDto] }, "delete": {} } }], [import("./modules/agency-procedure/agency-procedure.controller"), { "AgencyProcedureController": { "getAll": {}, "create": { type: t["./models/agency-procedure.entity"].AgencyProcedure }, "get": { type: t["./models/agency-procedure.entity"].AgencyProcedure }, "update": {}, "delete": {} } }], [import("./modules/client/client.controller"), { "ClientController": { "getAll": {}, "create": { type: t["./models/renting/client.entity"].Client }, "get": { type: t["./models/renting/client.entity"].Client }, "update": {}, "delete": {} } }], [import("./modules/apartment/apartment.controller"), { "ApartmentController": { "create": { type: t["./models/renting/apartment.entity"].Apartment }, "getAll": { type: Object }, "getAllOwnerApartments": {}, "getOwnerByApartmentId": { type: t["./models/user.entity"].User }, "getAvailableApartments": {}, "update": {}, "delete": {} } }], [import("./modules/apartment-rent/apartment-rent.controller"), { "ApartmentRentController": { "create": { type: t["./models/renting/apartment-rent.entity"].ApartmentRent }, "getAll": { type: Object }, "findByApartmentId": {}, "get": { type: t["./models/renting/apartment-rent.entity"].ApartmentRent }, "update": {}, "delete": {} } }], [import("./modules/car/car.controller"), { "CarController": { "getAll": {}, "getAllOwnerCars": {}, "create": { type: t["./models/renting/car.entity"].Car }, "get": { type: t["./models/renting/car.entity"].Car }, "update": {}, "delete": {} } }], [import("./modules/car-audit/car-audit.controller"), { "CarAuditController": { "getAll": {} } }], [import("./modules/car-rent/car-rent.controller"), { "CarRentController": { "getAll": {}, "create": { type: t["./models/renting/car-rent.entity"].CarRent }, "findByApartmentId": {}, "get": { type: t["./models/renting/car-rent.entity"].CarRent }, "update": {}, "delete": {} } }], [import("./modules/expense/expense.controller"), { "ExpenseController": { "getAll": {}, "getAllApartmentExpenses": {}, "getAllCarExpenses": {}, "create": { type: t["./models/renting/expense.entity"].Expense }, "getApartmentExpensesByMonth": { type: [t["./models/renting/expense.entity"].Expense] }, "getExpensesByMonthforCar": { type: [t["./models/renting/expense.entity"].Expense] }, "get": { type: t["./models/renting/expense.entity"].Expense }, "update": {}, "delete": {} } }], [import("./modules/car-rent-metric/car-rent-metric.controller"), { "CarRentMetricController": { "getTotalRevenueByYear": { type: Number }, "getTotalRevenueByQuarter": { type: Number }, "getTotalRevenueByMonth": { type: Number }, "getTotalRevenueByWeek": { type: Number }, "getTotalRentsByMonth": { type: Number }, "getTotalRentsByWeek": { type: Number }, "getCarOccupancyRate": { type: Number }, "getMonthlyCarOccupancyRate": { type: Number }, "getAverageDurationOfRentalsByMonth": { type: Number }, "getPopularRentalMonths": { type: [Object] }, "getTopRentedCars": { type: [Object] }, "getTopRentedCarsByMonth": { type: [Object] }, "getAverageExpenseCostByType": {}, "getMostExpensiveExpenses": { type: [t["./models/renting/expense.entity"].Expense] }, "getExpenseCostAugmentRate": { type: [Object] } } }], [import("./modules/appointment/appointment.controller"), { "AppointmentController": { "createAppointment": { type: t["./models/appointment.entity"].Appointment }, "updateAppointmentStatus": { type: t["./models/appointment.entity"].Appointment }, "cancelAppointment": {}, "getAll": {}, "getAvailableAppointmentTimes": { type: [String] }, "get": { type: t["./models/appointment.entity"].Appointment }, "getByUser": {}, "getByOwner": {} } }]] } };
};