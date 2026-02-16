import { memo, useState, useRef, useCallback, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { useMagneticHover } from '../../hooks/useMagneticHover';
import { useReducedMotion } from '../../contexts/ReduceMotionContext';
import styles from './Contact.module.css';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  [key: string]: string | undefined;
}

interface MagneticInputProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
}

const MagneticInput = memo(function MagneticInput({
  id,
  name,
  type = 'text',
  label,
  value,
  error,
  placeholder,
  required,
  multiline,
  onChange,
  onBlur,
}: MagneticInputProps) {
  const { ref, style, handlers } = useMagneticHover({ strength: 0.15 });
  const { disableNonCritical } = useReducedMotion();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    onBlur();
  };

  const inputClasses = `${styles.input} ${isFocused ? styles.focused : ''} ${error ? styles.error : ''} ${value ? styles.hasValue : ''}`;

  return (
    <div
      ref={ref}
      className={styles.inputWrapper}
      style={disableNonCritical ? {} : style}
      {...handlers}
    >
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={inputClasses}
          rows={5}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      {error && (
        <span id={`${id}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
      <div className={styles.inputGlow} />
    </div>
  );
});

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

const PARTICLE_COLORS = [
  'var(--color-accent-mint)',
  'var(--color-accent-pink)',
  'var(--color-accent-blue)',
  '#fbbf24',
  '#a78bfa',
];

interface ParticleBurstProps {
  trigger: boolean;
  origin: { x: number; y: number };
  onComplete: () => void;
}

const ParticleBurst = memo(function ParticleBurst({ trigger, origin, onComplete }: ParticleBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const { isReducedMotion } = useReducedMotion();

  useEffect(() => {
    if (!trigger || isReducedMotion) {
      if (trigger && !isReducedMotion) {
        onComplete();
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleCount = 50;
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: origin.x,
      y: origin.y,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15 - 5,
      size: Math.random() * 8 + 4,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)] as string,
      life: 0,
      maxLife: Math.random() * 60 + 40,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const aliveParticles = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.life++;
        p.vx *= 0.99;

        const progress = p.life / p.maxLife;
        const alpha = 1 - progress;
        const scale = 1 - progress * 0.5;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return p.life < p.maxLife;
      });

      particlesRef.current = aliveParticles;

      if (aliveParticles.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, origin, onComplete, isReducedMotion]);

  if (!trigger || isReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className={styles.particleCanvas}
      aria-hidden="true"
    />
  );
});

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.message.trim()) {
    errors.message = 'Message is required';
  } else if (data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  return errors;
};

export const Contact = memo(function Contact() {
  const [containerRef, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 });
  const submitRef = useRef<HTMLButtonElement>(null);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const newErrors = validateForm({ ...formData, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: newErrors[name] }));
    }
  }, [formData, touched]);

  const handleBlur = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const newErrors = validateForm(formData);
    setErrors((prev) => ({ ...prev, [name]: newErrors[name] }));
  }, [formData]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm(formData);
    setErrors(newErrors);
    setTouched({ name: true, email: true, message: true });

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (submitRef.current) {
      const rect = submitRef.current.getBoundingClientRect();
      setParticleOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    setShowParticles(true);
    setFormData({ name: '', email: '', message: '' });
    setTouched({});
  }, [formData]);

  const handleParticleComplete = useCallback(() => {
    setShowParticles(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsSuccess(false);
    setFormData({ name: '', email: '', message: '' });
    setErrors({});
    setTouched({});
  }, []);

  return (
    <section id="contact" className={styles.section}>
      <div
        ref={containerRef}
        className={`${styles.container} ${isVisible ? styles.visible : ''}`}
      >
        <h2 className={styles.title}>
          <span className={styles.titleAccent}>//</span> Get In Touch
        </h2>

        <p className={styles.subtitle}>
          Have a project in mind or just want to chat? I'd love to hear from you.
        </p>

        {isSuccess ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className={styles.successTitle}>Message Sent!</h3>
            <p className={styles.successText}>
              Thank you for reaching out. I'll get back to you as soon as possible.
            </p>
            <button
              onClick={handleReset}
              className={styles.resetButton}
              type="button"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <MagneticInput
              id="name"
              name="name"
              label="Name"
              value={formData.name}
              error={touched.name ? errors.name : undefined}
              placeholder="Your name"
              required
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
            />

            <MagneticInput
              id="email"
              name="email"
              type="email"
              label="Email"
              value={formData.email}
              error={touched.email ? errors.email : undefined}
              placeholder="your@email.com"
              required
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
            />

            <MagneticInput
              id="message"
              name="message"
              label="Message"
              value={formData.message}
              error={touched.message ? errors.message : undefined}
              placeholder="Tell me about your project..."
              required
              multiline
              onChange={handleChange}
              onBlur={() => handleBlur('message')}
            />

            <div className={styles.submitWrapper}>
              <button
                ref={submitRef}
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className={styles.spinner}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                  </span>
                ) : (
                  <>
                    Send Message
                    <svg className={styles.sendIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className={styles.socialLinks}>
        
        </div>
      </div>

      <ParticleBurst
        trigger={showParticles}
        origin={particleOrigin}
        onComplete={handleParticleComplete}
      />
    </section>
  );
});

export default Contact;
