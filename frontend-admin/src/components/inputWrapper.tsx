import { Theme } from "@emotion/react";
import { SxProps, TextField, TextFieldProps } from "@mui/material";
import { useState } from "react";

interface Props<T> {
  label: string;
  value: T;
  onChange: (val: T) => void;
  error?: boolean;
  sx?: SxProps<Theme>;
  disabled?: boolean;
  config?: Partial<TextFieldProps>;
}

const stringHelperText = "Can't be empty.";
const numHelperText = "Only accept non-zero positive integer.";

export const InputWrapper = <T extends string | number>(props: Props<T>) => {
  const { value, onChange, label, config, sx, disabled } = props;
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState("");

  // 驗證函式
  const validate = (val: string) => {
    if (typeof value === "number") {
      if (val === "") {
        // 清空情況，交給外部處理（這裡我先傳空字串）
        onChange("" as T);
        setError(false);
        setHelperText("");
        return;
      }
      const num = Number(val);
      if (!Number.isNaN(num) && Number.isInteger(num) && num > 0) {
        onChange(num as T);
        setError(false);
        setHelperText("");
      } else {
        setError(true);
        setHelperText(numHelperText);
      }
    } else {
      if (val.trim() === "") {
        setError(true);
        setHelperText(stringHelperText);
      } else {
        setError(false);
        setHelperText("");
      }
      onChange(val as T);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validate(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    validate(e.target.value);
  };

  return (
    <TextField
      {...config}
      disabled={disabled}
      error={error}
      helperText={helperText}
      sx={{ color: "black", ...sx }}
      variant="outlined"
      size="small"
      label={label}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};