import { describe, it, vi, expect } from 'vitest';
import { registerAllFormComponents } from './register';
import { registerCheckbox } from "./fields/Checkbox";
import { registerDatePicker } from "./fields/DatePicker";
import { registerFileInput } from "./fields/FileInput";
import { registerInput } from "./fields/Input";
import { registerRadioGroup } from "./fields/RadioGroup";
import { registerRichText } from "./fields/RichText";
import { registerSelect } from "./fields/Select";
import { registerSlider } from "./fields/Slider";
import { registerSwitch } from "./fields/Switch";
import { registerTextarea } from "./fields/Textarea";

// Mock all individual registration functions
vi.mock('./fields/Checkbox', () => ({ registerCheckbox: vi.fn() }));
vi.mock('./fields/DatePicker', () => ({ registerDatePicker: vi.fn() }));
vi.mock('./fields/FileInput', () => ({ registerFileInput: vi.fn() }));
vi.mock('./fields/Input', () => ({ registerInput: vi.fn() }));
vi.mock('./fields/RadioGroup', () => ({ registerRadioGroup: vi.fn() }));
vi.mock('./fields/RichText', () => ({ registerRichText: vi.fn() }));
vi.mock('./fields/Select', () => ({ registerSelect: vi.fn() }));
vi.mock('./fields/Slider', () => ({ registerSlider: vi.fn() }));
vi.mock('./fields/Switch', () => ({ registerSwitch: vi.fn() }));
vi.mock('./fields/Textarea', () => ({ registerTextarea: vi.fn() }));

describe('registerAllFormComponents', () => {
  it('should call all individual component registration functions', () => {
    registerAllFormComponents();

    expect(registerCheckbox).toHaveBeenCalledTimes(1);
    expect(registerDatePicker).toHaveBeenCalledTimes(1);
    expect(registerFileInput).toHaveBeenCalledTimes(1);
    expect(registerInput).toHaveBeenCalledTimes(1);
    expect(registerRadioGroup).toHaveBeenCalledTimes(1);
    expect(registerRichText).toHaveBeenCalledTimes(1);
    expect(registerSelect).toHaveBeenCalledTimes(1);
    expect(registerSlider).toHaveBeenCalledTimes(1);
    expect(registerSwitch).toHaveBeenCalledTimes(1);
    expect(registerTextarea).toHaveBeenCalledTimes(1);
  });
});
