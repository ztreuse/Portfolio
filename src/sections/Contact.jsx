import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { LuArrowUpRight, LuMail, LuPhone, LuSend } from 'react-icons/lu';
import Button from '../components/ui/Button';
import IconBadge from '../components/ui/IconBadge';
import Section from '../components/ui/Section';
import Reveal from '../components/ui/Reveal';
import { emailjsConfig, profile, socials } from '../data/site';

const contactDetails = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, icon: LuMail },
  { label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/[^+\d]/g, '')}`, icon: LuPhone },
  // Professional profiles sit alongside the direct contact details and open in a new tab.
  ...socials.map(({ label, handle, href, icon, logo }) => ({ label, value: handle, href, icon, logo, external: true })),
];

const statusMessages = {
  success: { text: "Thanks! Your message has been sent. I'll get back to you soon.", className: 'text-accent-strong' },
  error: { text: 'Something went wrong. Please try again or email me directly.', className: 'text-red-400' },
};

const inputClass =
  'w-full rounded-lg border border-line bg-surface px-4 py-3 text-white placeholder:text-stone-500 transition-colors outline-none focus:border-accent focus:ring-2 focus:ring-accent/25';

// `name` values must match the variables in the EmailJS template.
const Field = ({ label, name, as: Tag = 'input', ...props }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-stone-300">{label}</span>
    <Tag name={name} className={inputClass} required {...props} />
  </label>
);

const Contact = () => {
  const formRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await emailjs.sendForm(emailjsConfig.serviceId, emailjsConfig.templateId, formRef.current, {
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

  return (
    <Section
      id="contact"
      eyebrow="06 — Contact"
      title="Get in Touch"
      description="Have a project in mind or just want to say hi? I'm always open to discussing new opportunities and creative ideas."
    >
      <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
        <Reveal as="ul" x={-32} y={0} className="space-y-5 lg:col-span-2">
          {contactDetails.map(({ label, value, href, icon: Icon, logo, external }) => (
            <li key={label} className="group flex gap-4">
              <IconBadge icon={Icon} logo={logo} />
              <div className="min-w-0">
                <p className="font-display text-xs font-semibold tracking-[0.14em] text-accent uppercase">{label}</p>
                {href ? (
                  <a
                    href={href}
                    {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                    className="mt-1 inline-flex items-center gap-1.5 break-words text-white transition-colors hover:text-accent-strong"
                  >
                    {value}
                    {external && (
                      <LuArrowUpRight
                        aria-hidden
                        className="size-4 text-accent transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    )}
                  </a>
                ) : (
                  <p className="mt-1 text-white">{value}</p>
                )}
              </div>
            </li>
          ))}
        </Reveal>

        <Reveal as="form" x={32} y={0} delay={0.1} ref={formRef} onSubmit={handleSubmit} className="space-y-5 lg:col-span-3">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" name="user_name" placeholder="Your name" autoComplete="name" />
            <Field label="Email" name="user_email" type="email" placeholder="you@example.com" autoComplete="email" />
          </div>
          <Field label="Subject" name="subject" placeholder="What's this about?" />
          <Field label="Message" name="message" as="textarea" rows={6} placeholder="How can I help you?" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button type="submit" disabled={status === 'sending'} className="w-full sm:w-auto">
              {status === 'sending' ? 'Sending…' : 'Send Message'}
              <LuSend aria-hidden className="size-4" />
            </Button>
            <p role="status" className={`text-sm ${message?.className ?? ''}`}>
              {message?.text}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
};

export default Contact;
