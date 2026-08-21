"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";

type SubmissionStatus = "idle" | "preparing" | "ready" | "error";

const RECIPIENT = "armoredpangolin.info@gmail.com";

function textField(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export function ProjectEnquiryForm() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("preparing");
    setMessage("");

    try {
      const values = [
        ["Name", textField(formData, "name")],
        ["Company", textField(formData, "company")],
        ["Email", textField(formData, "email")],
        ["Phone", textField(formData, "phone")],
        ["Preferred contact", textField(formData, "preferredContact")],
        ["Project location", textField(formData, "location")],
        ["Service", textField(formData, "service")],
        ["Project", textField(formData, "projectTitle")],
        ["Quantity", textField(formData, "quantity")],
        ["Material", textField(formData, "material")],
        ["Thickness", textField(formData, "thickness")],
        ["Dimensions", textField(formData, "dimensions")],
        ["Finish", textField(formData, "finish")],
        ["Required by", textField(formData, "deadline")],
        ["Budget", textField(formData, "budget")],
        ["Scope", textField(formData, "scope")],
      ];
      const files = formData
        .getAll("files")
        .filter((entry): entry is File => entry instanceof File && entry.size > 0)
        .map((file) => file.name);
      const projectTitle = textField(formData, "projectTitle");
      const subject = encodeURIComponent(`Website project brief · ${projectTitle}`);
      const body = encodeURIComponent(
        `${values.map(([label, value]) => `${label}: ${value || "—"}`).join("\n")}\n\nReference files selected: ${files.length ? files.join(", ") : "None"}\n\nPlease attach any selected drawings or reference files to this email before sending.`,
      );

      window.location.href = `mailto:${RECIPIENT}?subject=${subject}&body=${body}`;
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The brief could not be sent. Please try again.");
    }
  }

  if (status === "ready") {
    return (
      <div className="project-success" role="status">
        <CheckCircle2 aria-hidden="true" />
        <p className="editorial-kicker">Email draft prepared</p>
        <h2>Your email app should now be open with the project details.</h2>
        <p>Attach any drawings or reference files, then press send. If no email app opened, email <a href={`mailto:${RECIPIENT}`}>{RECIPIENT}</a> directly.</p>
        <p>For time-sensitive work, call Morne on <a href="tel:+264815519040">+264 81 551 9040</a> or Flip on <a href="tel:+264811227510">+264 81 122 7510</a>.</p>
        <button type="button" className="editorial-button editorial-button-outline" onClick={() => setStatus("idle")}>Send another brief</button>
      </div>
    );
  }

  return (
    <form className="project-form" onSubmit={submit} encType="multipart/form-data">
      <input className="project-honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <fieldset>
        <legend><span>01</span> Your details</legend>
        <div className="project-field-grid">
          <label>
            <span>Name *</span>
            <input name="name" autoComplete="name" required />
          </label>
          <label>
            <span>Company</span>
            <input name="company" autoComplete="organization" />
          </label>
          <label>
            <span>Email *</span>
            <input type="email" name="email" autoComplete="email" required />
          </label>
          <label>
            <span>Phone *</span>
            <input type="tel" name="phone" autoComplete="tel" required />
          </label>
          <label>
            <span>Preferred contact</span>
            <select name="preferredContact" defaultValue="Email">
              <option>Email</option>
              <option>Phone call</option>
              <option>WhatsApp</option>
            </select>
          </label>
          <label>
            <span>Project location</span>
            <input name="location" placeholder="Swakopmund, Walvis Bay, mine site…" />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>02</span> Project requirements</legend>
        <div className="project-field-grid">
          <label>
            <span>Primary service *</span>
            <select name="service" defaultValue="" required>
              <option value="" disabled>Select a capability</option>
              <option>CNC plasma cutting</option>
              <option>CAD design & draughting</option>
              <option>Press-brake bending</option>
              <option>Welding & fabrication</option>
              <option>Machining</option>
              <option>Custom steelwork</option>
              <option>Multiple services / unsure</option>
            </select>
          </label>
          <label>
            <span>Project name *</span>
            <input name="projectTitle" required placeholder="Short project title" />
          </label>
          <label>
            <span>Quantity</span>
            <input name="quantity" placeholder="Prototype, 12 parts, once-off…" />
          </label>
          <label>
            <span>Material</span>
            <input name="material" placeholder="Mild steel, stainless, aluminium…" />
          </label>
          <label>
            <span>Material thickness</span>
            <input name="thickness" placeholder="3 mm, 10 mm plate…" />
          </label>
          <label>
            <span>Overall dimensions</span>
            <input name="dimensions" placeholder="Length × width × height" />
          </label>
          <label>
            <span>Finish</span>
            <input name="finish" placeholder="Raw, primed, painted, galvanised…" />
          </label>
          <label>
            <span>Required by</span>
            <input type="date" name="deadline" />
          </label>
          <label className="project-field-wide">
            <span>Budget range</span>
            <select name="budget" defaultValue="Not specified">
              <option>Not specified</option>
              <option>Under N$10,000</option>
              <option>N$10,000 – N$50,000</option>
              <option>N$50,000 – N$150,000</option>
              <option>Above N$150,000</option>
            </select>
          </label>
          <label className="project-field-wide">
            <span>What must be designed or built? *</span>
            <textarea name="scope" rows={8} required placeholder="Describe the application, operating conditions, important dimensions, loads, tolerances, site restrictions and the result you need." />
          </label>
          <label className="project-field-wide">
            <span>Drawings or reference files</span>
            <input type="file" name="files" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.dxf,.dwg,.step,.stp,.iges,.igs,.zip" />
            <small>Up to 3 files, 3 MB each and 4 MB total. PDF, images, CAD exchange files or ZIP.</small>
          </label>
        </div>
      </fieldset>

      <label className="project-consent">
        <input type="checkbox" name="consent" required />
        <span>I confirm these details may be used by Armored Pangolin to assess and respond to this enquiry.</span>
      </label>

      <button type="submit" className="editorial-button editorial-button-solid project-submit" disabled={status === "preparing"}>
        {status === "preparing" ? <><LoaderCircle className="project-spinner" aria-hidden="true" /> Preparing email</> : <>Open email draft <ArrowUpRight aria-hidden="true" /></>}
      </button>
      <p className="project-form-note">Your email app will open with the brief prefilled for armoredpangolin.info@gmail.com. Add selected drawings or reference files to that email before sending.</p>
      {status === "error" && <p className="project-form-error" role="alert">{message}</p>}
    </form>
  );
}
