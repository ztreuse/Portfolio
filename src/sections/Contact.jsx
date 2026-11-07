import { useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import emailjs from '@emailjs/browser';
import {
  LuArrowRight,
  LuArrowUpRight,
  LuCheck,
  LuCircleAlert,
  LuCircleCheck,
  LuCopy,
  LuLoaderCircle,
  LuMail,
  LuPhone,
} from 'react-icons/lu';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import Reveal from '../components/ui/Reveal';
import ContactFilm from './ContactFilm';
import { emailjsConfig, profile, socials } from '../data/site';

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

// Outlined inputs (16px text like the Experience bullets; 14px like the Skills chips looked too small to the owner,
// rounded-lg like the chips): a transparent box with a thin taupe
// border that strengthens on hover and focus (the owner asked for boxes instead of underlines, then for no fill, which
// looked like a generic form). Autofill: browsers paint their own white or blue fill on autofilled fields, so an inset
// shadow in the page colour covers it and the text keeps its colour.
const inputClass =
  'mt-2.5 block w-full rounded-lg border border-accent/35 bg-transparent px-4 py-2.5 text-base text-white placeholder:text-stone-500 transition-colors outline-none hover:border-accent/70 focus:border-accent-strong autofill:shadow-[inset_0_0_0_1000px_var(--color-ink)] autofill:[-webkit-text-fill-color:var(--color-white)]';

/**
 * One conversational form field ("What's your name?").
 * Keep the `name`s (user_name, user_email, subject, message); templateParams maps them to the template variables.
 */
const Field = ({ label, name, as: Control = 'input', className = '', ...props }) => (
  <label className={`group block ${className}`}>
    <span className="font-display text-[0.8125rem] font-bold tracking-[0.14em] text-stone-400 uppercase transition-colors group-focus-within:text-white">
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
 * One way to reach me: a round taupe icon badge, a small label over the value, and on the right either an action (the
 * copy button) or an arrow for links that leave the site. The row's divider fills taupe from the left on hover, like
 * the footer's old "Find me on" rows, which moved here (the owner found them redundant beside these).
 */
const ContactRow = ({ icon: Icon, label, href, external = false, action, children }) => (
  <li className="group relative flex items-center gap-3 border-b border-line">
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex min-w-0 flex-1 items-center gap-4 py-3.5"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-accent/35 text-accent-strong transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
        <Icon aria-hidden className="size-4" />
      </span>
      <span className="min-w-0">
        {label && (
          <span className="block font-display text-[0.8125rem] font-bold tracking-[0.14em] text-stone-400 uppercase">
            {label}
          </span>
        )}
        <span className="block font-display text-base font-semibold break-words text-white">{children}</span>
      </span>
    </a>
    {action ??
      (external && (
        <LuArrowUpRight
          aria-hidden
          className="size-5 shrink-0 text-stone-500 transition-[translate,color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-strong motion-reduce:transition-none"
        />
      ))}
    <span
      aria-hidden
      className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100"
    />
  </li>
);

/**
 * Contact: on the left, every way to reach me as one list (email with a copy button, phone, LinkedIn, GitHub,
 * JobStreet); on the right, a minimal form with outlined inputs and a pill send button. Both columns start at the
 * same line.
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
      >
        <div className="grid gap-14 lg:grid-cols-12 lg:items-start lg:gap-16">
          {/* Every way to reach me, as one list: email (with a copy button), phone and the profiles */}
          <Reveal x={-32} y={0} className="lg:col-span-5">
            <p className="font-display text-[0.8125rem] font-bold tracking-[0.14em] text-accent uppercase">
              Reach me directly
            </p>
            <ul className="mt-3">
              <ContactRow icon={LuMail} label="Email" href={`mailto:${profile.email}`} action={<CopyEmail />}>
                {/* If it must wrap (narrow phones), it breaks right after the @ */}
                {emailUser}@<wbr />
                {emailDomain}
              </ContactRow>
              <ContactRow icon={LuPhone} label="Phone" href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`}>
                {profile.phone}
              </ContactRow>
              {/* Profiles show just the platform's name (the owner removed the handles: "Troy Bay", "ztreuse") */}
              {socials.map(({ label, href, icon }) => (
                <ContactRow key={label} icon={icon} href={href} external>
                  {label}
                </ContactRow>
              ))}
            </ul>
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
            <Field label="Name" name="user_name" placeholder="Your full name" autoComplete="name" />
            <Field
              label="Email"
              name="user_email"
              type="email"
              placeholder="Where can I reply?"
              autoComplete="email"
            />
            <Field
              label="Subject"
              name="subject"
              placeholder="A front-end role, a project, a quick hello…"
              className="sm:col-span-2"
            />
            <Field
              label="Message"
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
