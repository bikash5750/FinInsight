import zod from "zod";

const RecordValidator = zod.object({

  amount: zod.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number"
  }).positive("Amount must be greater than 0"),

  recordid:zod.string()
  .min(3,"Id Must be greater then 3")
  .max(25,"Id cannot be greater then 25")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[a-z]/,"Must contain at least one character")
  .trim(),

  type: zod.enum(["income", "expense"]),
  
  date: zod.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }),

  category: zod.string()
    .min(3, "Category must be at least 3 characters")
    .max(20, "Category cannot exceed 20 characters")
    .trim(),

  notes: zod.string()
    .min(5, "Notes must be at least 5 characters")
    .max(200, "Notes cannot exceed 200 characters")
    .trim(),

});


const UpdateRecordValidator = zod.object(
  {
    amount: zod.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number"
  }).positive("Amount must be greater than 0")
  .optional(),

  recordid:zod.string()
  .min(3,"Id Must be greater then 3")
  .max(25,"Id cannot be greater then 25")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[a-z]/,"Must contain at least one character")
  .trim()
  .optional(),

  type: zod.enum(["income", "expense"]).optional(),

  date: zod.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).optional(),

  category: zod.string()
    .min(3, "Category must be at least 3 characters")
    .max(20, "Category cannot exceed 20 characters")
    .trim().optional(),

  notes: zod.string()
    .min(5, "Notes must be at least 5 characters")
    .max(200, "Notes cannot exceed 200 characters")
    .trim().optional(),
  }
)



const CheakRecordID = zod.object({
  recordid:zod.string()
  .min(3,"Id Must be greater then 3")
  .max(25,"Id cannot be greater then 25")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[a-z]/,"Must contain at least one character")
  .trim()
})
export { RecordValidator , UpdateRecordValidator , CheakRecordID};