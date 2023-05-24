import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Input, InputLabelWrapper } from '../';

const InputText = ({
  id,
  label,
  isSortable,
  sortDirection,
  onLabelClick,
  value,
  onChange,
}) => {
  // Only change the value to the Input if it indeed changes in the props.
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <InputLabelWrapper
      label={label}
      isSortable={isSortable}
      sortDirection={sortDirection}
      onLabelClick={onLabelClick}
    >
      <Input
        id={id}
        className="mt-2"
        type="text"
        containerClassName="mr-2"
        value={inputValue}
        onChange={event => {
          setInputValue(event.target.value);
          onChange(event.target.value);
        }}
      />
    </InputLabelWrapper>
  );
};

InputText.defaultProps = {
  value: '',
  isSortable: false,
  onLabelClick: () => {},
  sortDirection: 'none',
};

InputText.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  isSortable: PropTypes.bool,
  sortDirection: PropTypes.oneOf(['ascending', 'descending', 'none']),
  onLabelClick: PropTypes.func,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default InputText;
