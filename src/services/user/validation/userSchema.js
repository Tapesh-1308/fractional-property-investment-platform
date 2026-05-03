export const addBalanceSchema = {
    amount: {
        required: true,
        custom: (value) => {
            if (typeof value !== "number" || value <= 0) {
                return "Amount must be a positive number";
            }
            return null;
        },
    },
};