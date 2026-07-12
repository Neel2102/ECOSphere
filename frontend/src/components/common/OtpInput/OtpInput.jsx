import { useRef } from 'react';
import '../../../styles/common/otp-input.css';

// Six-box OTP entry with auto-advance, backspace navigation and paste support.
function OtpInput({ length = 6, value = '', onChange, error, disabled = false }) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length }, (item, index) => value[index] || '');

  const commit = (nextDigits, focusIndex) => {
    onChange?.(nextDigits.join(''));
    if (focusIndex !== undefined && inputsRef.current[focusIndex]) {
      inputsRef.current[focusIndex].focus();
    }
  };

  const handleChange = (index, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    commit(next, digit && index < length - 1 ? index + 1 : undefined);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      commit(next, index - 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array.from({ length }, (item, index) => pasted[index] || '');
    commit(next, Math.min(pasted.length, length - 1));
  };

  return (
    <div className={`otp-input${error ? ' has-error' : ''}`}>
      <div className="otp-input__boxes" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => (inputsRef.current[index] = element)}
            className="otp-input__box"
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={2}
            value={digit}
            disabled={disabled}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </div>
      {error && <p className="otp-input__error" role="alert">{error}</p>}
    </div>
  );
}

export default OtpInput;
