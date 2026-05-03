export const createPropertySchema = {
    total_value: {
        required: true,
        custom: (value) => {
            if (typeof value !== "number" || value <= 0) {
                return "Total value must be a positive number";
            }
            return null;
        },
    },
    total_slots: {
        required: true,
        custom: (value) => {
            if (!Number.isInteger(value) || value <= 0) {
                return "Total slots must be a positive integer";
            }

            if (value > 1_000_000) {
                return "Total slots too large";
            }
            
            return null;
        },
    }
}