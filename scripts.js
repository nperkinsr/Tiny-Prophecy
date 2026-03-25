const WAITLIST_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwx5pbZk6Jc3d7TMnvJo6xs0twG1DuEDPAQouk6pNhckDTLMTeUDvhA1wMoK5EVhq2-bg/exec";
const CONTACT_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzPwJ1viv0c4A2cVME81Sq8-uudB_JIEopirt7KQ3P3T44Ahm72qvhyRA6j5Fafd-Hh/exec";

const yearElement = document.querySelector("#year");
const notifyModal = document.querySelector("#notify-modal");
const notifyForm = document.querySelector("#notify-form");
const notifyEmailInput = document.querySelector("#notify-email");
const notifyProductInput = document.querySelector("#notify-product");
const modalProductName = document.querySelector("#modal-product-name");
const notifyStatus = document.querySelector("#notify-status");
const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("#contact-status");
const menuToggle = document.querySelector("#menu-toggle");
const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");
const heartInputs = document.querySelectorAll(".heart-toggle_input");

let modalTimer;
let activeHeartInput = null;

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

function setNotifyStatus(message) {
  if (notifyStatus) {
    notifyStatus.textContent = message;
  }
}

function setContactStatus(message) {
  if (contactStatus) {
    contactStatus.textContent = message;
  }
}

function postToIframe(endpoint, target, fields) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = endpoint;
  form.target = target;
  form.style.display = "none";

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

function openModal(productName, sourceInput) {
  if (!notifyModal || !notifyProductInput || !modalProductName) {
    return;
  }

  activeHeartInput = sourceInput;
  notifyProductInput.value = productName;
  modalProductName.textContent = productName;
  setNotifyStatus("");
  notifyModal.classList.add("is-open");
  notifyModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (notifyEmailInput) {
    notifyEmailInput.focus();
  }
}

function closeModal() {
  if (!notifyModal) {
    return;
  }

  notifyModal.classList.remove("is-open");
  notifyModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setNotifyStatus("");

  if (activeHeartInput) {
    activeHeartInput.checked = false;
    activeHeartInput = null;
  }
}

heartInputs.forEach((input) => {
  input.addEventListener("change", () => {
    window.clearTimeout(modalTimer);

    if (!input.checked) {
      return;
    }

    const productName = input.dataset.productName || "this product";

    modalTimer = window.setTimeout(() => {
      openModal(productName, input);
    }, 1000);
  });
});

document.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.hasAttribute("data-close-modal")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    window.clearTimeout(modalTimer);
    closeModal();
  }
});

mobileMenuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (menuToggle instanceof HTMLInputElement) {
      menuToggle.checked = false;
    }
  });
});

if (notifyForm) {
  notifyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(notifyForm);
    const email = String(formData.get("email") || "").trim();
    const product = String(formData.get("product") || "a product");
    const submitButton = notifyForm.querySelector('button[type="submit"]');

    if (!email) {
      if (notifyEmailInput) {
        notifyEmailInput.focus();
      }
      return;
    }

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }

    postToIframe(WAITLIST_ENDPOINT, "waitlist_target", { email, product });
    notifyForm.reset();
    setNotifyStatus(`You're on the list for ${product}.`);

    window.setTimeout(() => {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
      closeModal();
    }, 1600);
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const submitButton = contactForm.querySelector('button[type="submit"]');

    if (!name || !email || !message) {
      return;
    }

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }

    postToIframe(CONTACT_ENDPOINT, "contact_target", { name, email, message });
    contactForm.reset();
    setContactStatus("Your message has been sent.");

    window.setTimeout(() => {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
      setContactStatus("");
    }, 2200);
  });
}
