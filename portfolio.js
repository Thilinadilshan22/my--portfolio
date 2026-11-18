const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');

function applyTheme(theme) {
    root.dataset.theme = theme;
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
}

const systemTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
let savedTheme;
try {
    savedTheme = localStorage.getItem('theme');
} catch {
    // Theme controls still work when storage is unavailable.
}

applyTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : systemTheme);
themeToggle.hidden = false;
themeToggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try {
        localStorage.setItem('theme', theme);
    } catch {
        // A local preference for this visit is enough.
    }
});

const skillStatus = document.querySelector('#skill-status');
const projectLink = document.querySelector('#skill-project-link');
const projectCards = [...document.querySelectorAll('.project')];
const skillButtons = [...document.querySelectorAll('[data-projects]')].map((tag) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = tag.className;
    button.dataset.projects = tag.dataset.projects;
    button.textContent = tag.textContent;
    button.setAttribute('aria-pressed', 'false');
    tag.replaceWith(button);
    return button;
});
document.querySelector('#skills-hint').hidden = false;

skillButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const selected = button.getAttribute('aria-pressed') === 'false';
        const projectIds = selected ? button.dataset.projects.split(' ') : [];
        const names = [];

        skillButtons.forEach((skill) => {
            skill.setAttribute('aria-pressed', String(selected && skill === button));
        });
        projectCards.forEach((project) => {
            const matches = projectIds.includes(project.id);
            project.classList.toggle('is-match', matches);
            if (matches) names.push(project.querySelector('h3').textContent);
        });
        skillStatus.textContent = selected ? button.textContent + ' appears in ' + names.join(', ') + '.' : '';
        projectLink.hidden = !selected;
        projectLink.href = selected ? '#' + projectIds[0] : '#projects';
    });
});

const form = document.querySelector('#contact-form');
const draft = document.querySelector('#email-draft');
const message = form.elements.namedItem('message');
const subject = form.elements.namedItem('subject');
const count = document.querySelector('#message-count');
const recipient = document.querySelector('#email-link').getAttribute('href').slice('mailto:'.length);
let suggestedSubject = '';

form.addEventListener('change', (event) => {
    if (event.target.name === 'topic' && (!subject.value.trim() || subject.value === suggestedSubject)) {
        suggestedSubject = event.target.value;
        subject.value = suggestedSubject;
        subject.setCustomValidity('');
    }
});

message.addEventListener('input', () => {
    count.textContent = message.value.length + ' / ' + message.maxLength;
});

for (const field of [form.elements.namedItem('name'), subject, message]) {
    field.addEventListener('input', () => field.setCustomValidity(''));
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.elements.namedItem('name');
    const email = form.elements.namedItem('email');
    name.setCustomValidity(name.value.trim() ? '' : 'Enter your name.');
    subject.setCustomValidity(subject.value.trim() ? '' : 'Enter a subject.');
    message.setCustomValidity(message.value.trim().length >= message.minLength ? '' : 'Write at least 10 characters.');
    if (!form.reportValidity()) return;

    const body = message.value.trim() + '\n\n' + name.value.trim() + '\nReply to ' + email.value.trim();
    const encodedSubject = encodeURIComponent(subject.value.trim());
    const encodedBody = encodeURIComponent(body);
    document.querySelector('#open-draft').href = 'mailto:' + recipient + '?subject=' + encodedSubject + '&body=' + encodedBody;
    document.querySelector('#open-gmail').href = 'https://mail.google.com/mail/?view=cm&fs=1&to='
        + encodeURIComponent(recipient) + '&su=' + encodedSubject + '&body=' + encodedBody;
    form.hidden = true;
    draft.hidden = false;
    draft.querySelector('h3').focus();
});

document.querySelector('#edit-draft').addEventListener('click', () => {
    draft.hidden = true;
    form.hidden = false;
    subject.focus();
});

form.hidden = false;
