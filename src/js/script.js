document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-form]');

  if (form) {
    // Проверка агримента
    const agreement = form.querySelector('input[name="agreement"]');
    const submitButton = form.querySelector('[data-form-submit]');
    if (agreement && submitButton) {
      agreement.addEventListener('change', () => {
        submitButton.disabled = !agreement.checked;
      });
    }
    // Проверка заполненности имейла + фильтр по допустимым символам
    const emailInput = form.querySelector('input[type="email"]');
    const emailWarning = form.querySelector('[data-form-email-warning]');
    if (emailInput) {
      emailInput.addEventListener('input', () => {
        emailInput.value = emailInput.value.replace(/[^a-zA-Z0-9@._+-]/g, '');

        if (emailWarning) {
          if (emailInput.value !== '') {
            emailWarning.classList.add('active');
          } else {
            emailWarning.classList.remove('active');
          }
        }
      });
    }

    // Разрешенные символы для телефона
    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        phoneInput.value = phoneInput.value.replace(/[^0-9+\s\-()]/g, '');
      });
    }

    // Создание ошибки инпута
    function createInputError(input) {
      const parent = input.parentElement;
      let error = parent.querySelector('[data-error]');
      if(!error) {
        error = document.createElement('span')
        error.setAttribute('data-error', true);
        error.classList.add('form__error');
        error.textContent = 'Укажите данные';
        parent.append(error)
      }
      if (input.value.trim() !== '') {
        error.remove();
      }
    }
    const requiredInputs = form.querySelectorAll('input[required]');
    if (requiredInputs.length > 0) {
      requiredInputs.forEach((input) => {
        input.addEventListener('blur', () => createInputError(input));
      });
    }

    // Алерты после отправки формы
    function showAlert(templateId) {
      const template = document.getElementById(templateId);
      if (!template) return;

      const fragment = template.content.cloneNode(true);
      const alertEl = fragment.querySelector('[data-alert]');
      if (!alertEl) return;

      const closeButtons = alertEl.querySelectorAll('[data-alert-close]');
      closeButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          alertEl.remove();
        });
      });

      document.body.append(alertEl);
    }

    // Отправка формы
    const alertVariables = ['success-alert', 'email-error-alert', 'error-alert'];
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      let hasEmpty = false;
      requiredInputs.forEach((input) => {
        createInputError(input);
        if (!input.value.trim()) {
          hasEmpty = true;
        }
      });

      if(!hasEmpty) {
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * alertVariables.length);
          showAlert(alertVariables[randomIndex]);
          form.reset();
          if (submitButton) {
            submitButton.disabled = false;
          }
        }, 100);
      }
    });
  }


});

