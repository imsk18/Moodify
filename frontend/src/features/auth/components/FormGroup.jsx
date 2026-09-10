import React from 'react'

const FormGroup = ({label,placeholder,onChange,value, type="text"}) => {
  return (
    <div className="form-group">
        <label htmlFor={label}>{label}</label>
       <input
        type={type}
        id={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default FormGroup