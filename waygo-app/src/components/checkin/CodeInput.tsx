import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CodeInputProps {
  length?: number;
  onComplete: (code: string) => void;
  value?: string;
}

export function CodeInput({ length = 6, onComplete, value: externalValue }: CodeInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const [isComplete, setIsComplete] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (externalValue) {
      const chars = externalValue.slice(0, length).split('');
      const newValues = Array(length).fill('');
      chars.forEach((char, i) => {
        newValues[i] = char;
      });
      setValues(newValues);
      if (chars.length >= length) {
        setIsComplete(true);
        onComplete(externalValue.slice(0, length));
      }
    }
  }, [externalValue, length, onComplete]);

  const handleChange = (index: number, char: string) => {
    const newValues = [...values];
    newValues[index] = char.toUpperCase();
    setValues(newValues);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const code = newValues.join('');
    if (code.length === length && !code.includes('')) {
      setIsComplete(true);
      onComplete(code);
    } else {
      setIsComplete(false);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().slice(0, length);
    const chars = pasted.split('');
    const newValues = [...values];

    chars.forEach((char, i) => {
      if (i < length) newValues[i] = char;
    });

    setValues(newValues);

    const lastFilledIndex = Math.min(chars.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    const code = newValues.join('');
    if (code.length === length && !code.includes('')) {
      setIsComplete(true);
      onComplete(code);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2" onPaste={handlePaste}>
        {values.map((char, index) => (
          <motion.div
            key={index}
            initial={false}
            animate={{
              scale: isComplete ? 1.05 : 1,
              backgroundColor: isComplete ? '#00D4C8' : '#2a2a2a',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <input
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={char}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-2xl font-bold bg-waygo-darkLight border-2 rounded-xl transition-colors ${
                char
                  ? 'border-waygo-teal text-white'
                  : 'border-gray-600 text-white'
              } focus:border-waygo-teal focus:outline-none`}
              style={{ caretColor: 'transparent' }}
            />
          </motion.div>
        ))}
      </div>
      <p className="text-gray-400 text-sm">Enter the 6-digit code from the business</p>
    </div>
  );
}