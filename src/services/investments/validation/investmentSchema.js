export const createInvestmentSchema = {
    user_id: {
        required: true,
        custom: (value) => {
            if (!Number.isInteger(value) || value <= 0) {
                return "User ID must be a positive integer";
            }
            return null;
        }
    },
    property_id: {
        required: true,
        custom: (value) => {
            if (!Number.isInteger(value) || value <= 0) {
                return "Property ID must be a positive integer";
            }
            return null;
        },
    },
    slots: {
        required: true,
        custom: (value) => {
            if (!Number.isInteger(value) || value <= 0) {
                return "Slots must be a positive integer";
            }

            if (value > 1_000_000) {
                return "Slots too large";
            }

            return null;
        },
    },
};
