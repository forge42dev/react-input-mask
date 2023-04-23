import React from "react";
import { useInputMask } from "../hook/useInputMask";

const App = () => {
  const inputProps = useInputMask({
    mask: "55aa**-****-****-****",
    onChange: (value) => {
      console.log(value);
    },
    placeholderChar: "_",
    type: "mask",
  });

  return (
    <div>
      <input
        {...inputProps}
        onChange={(e) => {
          console.log(e.target.value);
        }}
        type="text"
      />
    </div>
  );
};

export { App };
