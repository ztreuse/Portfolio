import { useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import emailjs from '@emailjs/browser';
import { LuArrowRight, LuCheck, LuCircleAlert, LuCircleCheck, LuCopy, LuLoaderCircle } from 'react-icons/lu';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import Reveal from '../components/ui/Reveal';
import ContactFilm from './ContactFilm';
import { emailjsConfig, profile } from '../data/site';

const [emailUser, emailDomain] = profile.email.split('@');

const statusMessages = {
  success: {
    text: "Thanks! Your message has been sent. I'll get back to you soon.",
    icon: LuCircleCheck,
    className: 'text-accent-strong',
  },
  error: {
    text: 'Something went wrong. Please try again or email me directly.',
    icon: LuCircleAlert,
    className: 'text-red-400',
  },
};

// Underline-only inputs: no boxes, just a line that warms to taupe on focus.
const inputClass =
  'w-full border-0 border-b border-line bg-transparent px-0 pt-2 pb-3 text-base text-white placeholder:text-stone-500 transition-colors outline-none focus:border-accent sm:text-lg';

/**
 * One conversational form field ("What's your name?").
 * Keep the `name`s (user_name, user_email, subject, message); templateParams maps them to the template variables.
 */
const Field = ({ label, name, as: Control = 'input', className = '', ...props }) => (
  <label className={`group block ${className}`}>
    <span className="font-heading text-base font-bold tracking-[0.16em] text-stone-400 uppercase transition-colors group-focus-within:text-white">
      {label}
    </span>
    <Control name={name} className={inputClass} required {...props} />
  </label>
);

/**
 * EmailJS only fills template variables whose names match exactly, and templates commonly use {{name}}, {{email}}
 * and {{title}} (the default "Contact Us" template) or {{from_name}} / {{reply_to}}. Sending each field under all
 * of those names means the name, email and subject arrive whichever ones the template uses, not just the message.
 */
const templateParams = (form) => {
  const data = new FormData(form);
  const name = data.get('user_name');
  const email = data.get('user_email');
  const subject = data.get('subject');
  return {
    user_name: name,
    from_name: name,
    name,
    user_email: email,
    from_email: email,
    email,
    reply_to: email,
    subject,
    title: subject,
    message: data.get('message'),
    time: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
  };
};

/** Copies the email address and briefly confirms it. */
const CopyEmail = () => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Email copied' : 'Copy email address'}
      title={copied ? 'Copied!' : 'Copy email'}
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-ink/40 text-stone-200 transition-colors hover:border-accent hover:bg-accent hover:text-ink"
    >
      {copied ? (
        <LuCheck aria-hidden className="size-4 text-accent-strong" />
      ) : (
        <LuCopy aria-hidden className="size-4" />
      )}
    </button>
  );
};

/**
 * Contact: on the left, the direct line (email large in the display font, copy button, phone underneath); on the
 * right, a minimal form with underline inputs and a pill send button.
 */
const Contact = () => {
  const formRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await emailjs.send(emailjsConfig.serviceId, emailjsConfig.templateId, templateParams(formRef.current), {
        publicKey: emailjsConfig.publicKey,
      });
      formRef.current.reset();
      setStatus('success');
    } catch (error) {
      console.error('EmailJS error:', error);
      setStatus('error');
    }
  };

  const message = statusMessages[status];
  const sending = status === 'sending';
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* The Skills → Contact film: a pre-rendered 3D shot scrubbed by the scroll */}
      {!reduceMotion && <ContactFilm />}
      <Section
        id="contact"
        eyebrow="06 — Contact"
        // On the colour of the desk film's glowing screen, which the film ends on
        className="tone-light tone-screen bg-ink"
        title="Let's work together"
        description="Have a project in mind or just want to say hi? I'm always open to discussing new opportunities and creative ideas."
      >
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* Direct line */}
          <Reveal x={-32} y={0} className="lg:col-span-5">
            <p className="font-heading text-base font-bold tracking-[0.16em] text-accent uppercase">
              Reach me directly
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="group min-w-0 font-display text-lg font-semibold text-white sm:text-xl"
              >
                <span className="bg-linear-to-r from-accent-strong to-accent-strong bg-size-[0%_2px] bg-bottom-left bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-size-[100%_2px]">
                  {/* If it must wrap (narrow phones), it breaks right after the @ */}
                  {emailUser}@<wbr />
                  {emailDomain}
                </span>
              </a>
              <CopyEmail />
            </div>
            <a
              href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`}
              className="mt-5 inline-flex items-center gap-3 text-stone-300 transition-colors hover:text-white"
            >
              <span className="font-heading text-base font-bold tracking-[0.16em] text-stone-400 uppercase">Phone</span>
              {profile.phone}
            </a>
          </Reveal>

          {/* Form */}
          <Reveal
            as="form"
            x={32}
            y={0}
            delay={0.1}
            ref={formRef}
            onSubmit={handleSubmit}
            className="grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:col-span-7"
          >
            <Field label="What's your name?" name="user_name" placeholder="Your full name" autoComplete="name" />
            <Field
              label="Your email"
              name="user_email"
              type="email"
              placeholder="Where can I reply?"
              autoComplete="email"
            />
            <Field
              label="What's it about?"
              name="subject"
              placeholder="A front-end role, a project, a quick hello…"
              className="sm:col-span-2"
            />
            <Field
              label="Your message"
              name="message"
              as="textarea"
              rows={4}
              placeholder="Tell me a little about it…"
              className="sm:col-span-2 [&_textarea]:resize-none"
            />

            <div className="flex flex-col-reverse gap-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p role="status" className={`flex min-h-5 items-center gap-2 text-sm ${message?.className ?? ''}`}>
                {message && <message.icon aria-hidden className="size-4 shrink-0" />}
                {message?.text}
              </p>
              <Button
                type="submit"
                disabled={sending}
                // Compact pill on every screen; on phones it sits at the left under the fields
                className="shrink-0 max-sm:self-start"
                icon={sending ? <LuLoaderCircle aria-hidden className="size-4 animate-spin" /> : LuArrowRight}
              >
                {sending ? 'Sending…' : 'Send message'}
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
};

export default Contact;
