# React Input Mask
![GitHub Repo stars](https://img.shields.io/github/stars/Code-Forge-Net/react-input-mask?style=social)
![npm](https://img.shields.io/npm/v/@code-forge/react-input-mask?style=plastic)
![GitHub](https://img.shields.io/github/license/Code-Forge-Net/react-input-mask?style=plastic)
![npm](https://img.shields.io/npm/dy/@code-forge/react-input-mask?style=plastic)
![GitHub issues](https://img.shields.io/github/issues/Code-Forge-Net/react-input-mask?style=plastic)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Code-Forge-Net/react-input-mask?style=plastic)
![GitHub last commit](https://img.shields.io/github/last-commit/Code-Forge-Net/react-input-mask?style=plastic)
![GitHub top language](https://img.shields.io/github/languages/top/Code-Forge-Net/react-input-mask?style=plastic) 

React Input Mask is an open source library for React that provides an easy way to apply masks to input fields.

Masks can be used to enforce specific formatting for user input, such as phone numbers, social security numbers, and credit card numbers. With React Input Mask, you can define a mask for your input field, and the library will automatically format the user's input according to the specified mask.

## Why React Input Mask?

React Input Mask is a lightweight library that provides a simple API for applying masks to input fields. It is built on top of React Hooks, and is designed to be used with functional components. It is also compatible with libraries such as react-hook-form.
The design philosophy behind React Input Mask is to provide a simple API that is easy to use and understand via a hook instead of
a component.

It is also designed to be used with Remix.run and other server-side rendering frameworks.

## Installation
React Input Mask can be installed via npm or yarn:

 
`npm install @code-forge/react-input-mask`
 

`yarn add @code-forge/react-input-mask`

## Usage
Using React Input Mask is easy. Simply import the useInputMask hook from the library, and pass the mask prop to the hook. The hook will return an object containing the value and onMouseDown props that you can pass to your input field.

```jsx 
import React from 'react';
import { useInputMask } from 'react-input-mask';

const MyComponent = () => {
  const inputProps = useInputMask({ mask: '+(999) 999-9999' });
  return (
    <input name="phone" {...inputProps} onChange={e => {
      // Your onChange handler gets the output of the hook (won't trigger if the input is invalid)
      console.log(e.target.value);
    }} />
  );
};
```


In the example above, we've applied a mask to a phone number input field. The mask prop specifies the format of the phone number.

You can customize the mask to fit your needs by using a variety of special characters that represent different types of input. 

| Character | Description |
|-----------|-------------|
| 9 | Represents a number.|
| A | Represents a letter. |
| * | Represents a wildcard. |

## Available Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| mask | string | The mask to apply to the input field. | undefined |
| placeholderChar | string | The character to use as a placeholder for the mask characters (eg. 999-999 with placeholderChar set to "@" will produce @@@-@@@). | "_" |
| charRegex | RegExp | A regular expression that represents the characters that are allowed to be entered into the input field. | /^[a-zA-Z]*$/|
| numRegex | RegExp | A regular expression that represents the numbers that are allowed to be entered into the input field. | /^[0-9]*$/ |
| type | "raw" or "mask" | The type of value to return from the hook. If set to "raw", the hook will return the raw value of the input field (eg. mask 999-999-99 with 111-111-11 will output 11111111). If set to "mask", the hook will return the masked value of the input field. (eg. mask 999-999-99 with 111-111-11 will output 111-111-11) | "raw" |


## Examples
### Phone Number
```jsx
import React from 'react';
import { useInputMask } from 'react-input-mask';

const MyComponent = () => {
  const inputProps = useInputMask({ mask: '+(999) 999-9999' });
  return (
    <input name="phone" {...inputProps} />
  );
};
```

### Social Security Number
```jsx
import React from 'react';
import { useInputMask } from 'react-input-mask';

const MyComponent = () => {
  const inputProps = useInputMask({ mask: '999-99-9999' });
  return (
    <input name="ssn" {...inputProps} />
  );
};
```

### Credit Card Number
```jsx
import React from 'react';
import { useInputMask } from 'react-input-mask';

const MyComponent = () => {
  const inputProps = useInputMask({ mask: '9999 9999 9999 9999' });
  return (
    <input name="cc" {...inputProps} />
  );
};
```

### Usage with react-hook-form

```jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useInputMask } from 'react-input-mask';

const MyComponent = () => {
  const { register, handleSubmit } = useForm();
  const inputProps = useInputMask({ mask: '9999 9999 9999 9999' });
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('cc')} {...inputProps} />
      <button type="submit">Submit</button>
    </form>
  );
};
```
## Support 

If you like the project, please consider supporting us by giving a ⭐️ on Github.

## License

MIT

## Bugs

If you find a bug, please file an issue on [our issue tracker on GitHub](https://github.com/Code-Forge-Net/react-input-mask/issues)


## Contributing

Thank you for considering contributing to react-input-mask! We welcome any contributions, big or small, including bug reports, feature requests, documentation improvements, or code changes.

To get started, please fork this repository and make your changes in a new branch. Once you're ready to submit your changes, please open a pull request with a clear description of your changes and any related issues or pull requests.

Please note that all contributions are subject to our [Code of Conduct](https://github.com/Code-Forge-Net/react-input-mask/blob/main/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

We appreciate your time and effort in contributing to react-input-mask and helping to make it a better tool for the community!
