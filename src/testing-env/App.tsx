import React from "react";
import { useInputMask } from "../hook/useInputMask";
import { useForm } from "react-hook-form";

const App = () => {
  const { register, watch } = useForm();
  const regArgs = register("test");
  const inputProps = useInputMask({
    mask: "9999 9999 9999 9999",
    placeholderChar: "_",
    type: "raw",
    value: "9999999999999999",
  });
  const test = watch("test");
  console.log(test);
  return (
    <div>
      <input {...regArgs} {...inputProps} type="text" />
    </div>
  );
};

export { App };
