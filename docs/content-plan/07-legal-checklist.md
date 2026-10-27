# 07 — Legal and business setup checklist

Status: for Attila. Not legal or tax advice. Check each item with an accountant (könyvelő) or lawyer.
Order: do section A before the site goes public. Do section C before you sell the first training.

---

## A. Register the business (before launch)

- [ ] **Choose tax regime with an accountant.** For a B2B sole trader the usual options are
      *átalányadó* (flat-rate cost ratio; 45% in 2026, 50% from 2027) or *vállalkozói SZJA*.
      KATA is not a fit: since September 2022 it is only for revenue from private persons.
      Source (cost ratio): https://adozona.hu/2026_os_adovaltozasok/NAV_kiva_alanyi_afamentes_ertekhatar_alanyi_LY9J4U
- [ ] **Choose VAT status.** Subjective VAT exemption (*alanyi adómentesség*, "AAM") is possible if
      revenue stays under 20 million Ft in 2026 (22 million Ft in 2027, 24 million Ft in 2028).
      Source: https://nav.gov.hu/ado/afa/Emelkedik_az_alanyi_adomentesseg_ertekhatara
- [ ] **Choose activity codes (TEÁOR'25)** with the accountant. Cover: management consulting, other
      education/training, IT/programming services. `{{CHECK: exact TEÁOR'25 codes}}`
- [ ] **Register as egyéni vállalkozó** online (Ügyfélkapu+ / webes ügysegéd) or at a kormányablak.
      You get the registration number and the tax number.
- [ ] **Chamber registration** (kamarai regisztráció) — required for sole traders; small yearly fee.
- [ ] **Business bank account** and an **invoicing program** connected to NAV Online Számla.
- [ ] **Fill the Impressum** (`06-legal-impressum-en-hu.md`) with the new numbers.
- [ ] **Hosting provider details** for the Impressum: name, address, email.
- [ ] Optional: **professional liability insurance** (szakmai felelősségbiztosítás) for consulting
      and automation work.

---

## B. Website data protection (before launch)

### Privacy notice (`/privacy`, `/hu/privacy`) — update
- [ ] **Controller:** your full name as egyéni vállalkozó, address, email (same as Impressum).
- [ ] **List every data flow**, with purpose, legal basis, data, retention:

| Data flow | Data | Legal basis | Retention `{{DECIDE}}` |
| --- | --- | --- | --- |
| Contact form / email | name, email, message | Steps before a contract / legitimate interest (GDPR 6(1)(b)/(f)) | e.g. 1 year after last contact |
| Scorecard and audit | first name, email, answers, optional company data | Consent or contract for the free report (GDPR 6(1)(a)/(b)) | e.g. 2 years |
| Scorecard reminders (max. 3) | email | Consent (separate checkbox) | until finished or withdrawn |
| Follow-up email series | email, first name | Consent (separate checkbox) | until unsubscribe |
| Booking tool | name, email, time | Steps before a contract | e.g. 1 year |
| Clients and invoices | company and contact data | Contract; legal obligation (accounting: 8 years) | 8 years for invoices |
| Analytics | `{{FILL: cookieless? IP?}}` | Consent or legitimate interest (depends on tool) | per tool |

- [ ] **List all processors** (adatfeldolgozók) with name and country: hosting, email sending service,
      form backend, PDF/report generator, booking tool, analytics, CRM. `{{FILL}}`
- [ ] **Transfers outside the EU** (e.g. US tools): name the safeguard (EU–US Data Privacy Framework
      or standard contractual clauses).
- [ ] **Rights of the data subject** and the complaint authority: NAIH, 1055 Budapest, Falk Miksa utca 9–11.,
      ugyfelszolgalat@naih.hu, www.naih.hu `{{CHECK: current address}}`
- [ ] Add "Last updated" date.

### Consent on forms
- [ ] Privacy notice checkbox and marketing/reminder consent are **separate** checkboxes.
- [ ] Marketing and reminder boxes are **optional and not pre-ticked**.
- [ ] Every marketing email has an **unsubscribe** link.
- [ ] Store the consent record: what text, when, which checkbox.

### Cookies (`/cookies`)
- [ ] List each cookie/local storage item, its purpose and duration.
- [ ] If you use only strictly necessary cookies and cookieless analytics, a banner is usually not
      needed — say so in the cookie notice. If you use GA4, ads pixels or similar, show a consent banner
      with equal "Accept" and "Reject" buttons, and load those scripts only after consent.

---

## C. Training business (before the first paid training)

- [ ] **Adult training registration (felnőttképzési bejelentés).** Under the Adult Training Act
      (Fktv., 2013. évi LXXVII. törvény), organised training aimed at developing competences counts as
      adult training. Since 1 September 2020 such training may only be run after registration with the
      Pest Vármegyei Kormányhivatal. Funded (state/EU) and vocational training needs a permit (engedély).
      Sources: https://eurydice.eacea.ec.europa.eu/hu/eurypedia/hungary/felnottoktatas-es-felnottkepzes ·
      https://njt.jog.gov.hu/jogszabaly/2013-77-00-00
      - [ ] Ask the Kormányhivatal (felnottkepzes@pest.gov.hu) or a felnőttképzési consultant whether
            your in-company trainings fall under the Act, and what the duties are (training programme,
            adult training contract, data reporting in FAR, financial guarantee if any).
      - [ ] If yes: register, then add the registration number to the Impressum and the FAQ.
      - [ ] Write a **képzési program** for each training topic (Lean in the office, Problem solving, AI at work).
      - Why it matters for sales too: a registration number shows the buyer that you are a real
        training provider. Some HR departments ask for it.
- [ ] **AI at work training — legal angle (use carefully in sales).** The EU AI Act Article 4 asks
      providers and deployers of AI systems (any company whose staff use AI tools at work) to take
      measures to support AI literacy of their staff. The article was amended on 27 July 2026 (Digital
      Omnibus, Regulation (EU) 2026/1744): it no longer requires a guaranteed level, and no certificate
      is required, but a record of training is useful.
      Source: https://ahaslides.com/templates/courses/requirements/eu-ai-act-ai-literacy-requirement/
      Copy rule: say "helps you document AI literacy measures", never "mandatory" or "avoid fines".

---

## D. Contracts and terms (before the first sale)

- [ ] **ÁSZF / Terms (B2B)** for trainings, workshops and projects: scope, prices, payment terms,
      cancellation (e.g. free until 10 working days before; 50% after; 100% within 2 days), rescheduling,
      liability limit, intellectual property of training materials, confidentiality.
- [ ] **Order confirmation template** for trainings (date, place, participants, price, VAT text).
- [ ] **Consulting/project contract template** (megbízási szerződés): deliverables, acceptance,
      change requests, liability cap.
- [ ] **Reference permission clause** (for the launch price): the client allows publication of
      anonymised or named results, after written approval of the final text.
- [ ] **Data processing agreement** (adatfeldolgozói szerződés) for projects where you touch the
      client's personal data (automation, AI, reports).
- [ ] **Launch price and guarantee text**: write the exact conditions in the Terms (who qualifies,
      how the saving is measured, what "do not pay" means for the workshop).

---

## E. Claims on the website (before launch)

- [ ] Every number is real and documented. Keep the source (email, report, screenshot) in a private folder.
- [ ] Past employers: get permission or anonymise the name. Never use a logo without permission.
- [ ] "Green Belt": state the issuer. Do not imply a higher belt or a certification you do not have.
- [ ] Testimonials: real person, written approval, keep the approval email.
- [ ] Launch price: state the true regular price you will charge after the launch period.
