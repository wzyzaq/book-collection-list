import React from 'react';
import { InputRef } from '../input';
import { TdTagInputProps } from './type';
import { StyledProps } from '../common';
export interface TagInputProps extends TdTagInputProps, StyledProps {
    options?: any[];
}
declare const TagInput: React.ForwardRefExoticComponent<TagInputProps & React.RefAttributes<InputRef>>;
export default TagInput;
