import { RatingField } from "@/entities/field";
import { z } from "zod";
import { registerField } from "../registry";

const schema = z.object({
  label: z.string().min(1, "Label is required"),
  allowedTypes: z.string().optional(),
  maxRating: z.number().int().min(1).max(5),
});
registerField<RatingField>({
  type: "rating",
  label: "Rating",
  icon: "rating",
  defaultConfig: {
    label: "Add rating",
    maxRating: 5,
  },
  configSchema: schema,
  validationRules(field, value, isRequired) {
    const errors: string[] = [];

    if (typeof value === "number" && (value <= 0 || value > field.maxRating)) {
      errors.push(`Minimum rating is 1 and maximum rating is ${field.maxRating}.`);
    }

    return errors;
  },
  getSupportedOperators() {
    return ["equals", "not-equals", "greater-than", "less-than"];
  },
  pdfFormatter(field, value) {
    if (value === null || value === undefined) return "—";
    return String(value);
  },
});
