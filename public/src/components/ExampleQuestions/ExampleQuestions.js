/**
 * ExampleQuestions Component
 * Displays a list of example questions as clickable chips
 */
export class ExampleQuestions {
  constructor(questions, onQuestionClick) {
    this.questions = questions || [
      'What services do you offer?',
      'How much per pallet?',
      'Where are your warehouses?',
      'Can I tour the facility?',
      'Do you offer delivery?',
      'How fast can I move in?'
    ];
    this.onQuestionClick = onQuestionClick;
    this.element = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'example-questions';

    const title = document.createElement('div');
    title.className = 'example-questions-title';
    title.textContent = 'Try asking:';

    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'question-chips';

    this.questions.forEach(question => {
      const chip = document.createElement('button');
      chip.className = 'question-chip';
      chip.textContent = question;
      chip.dataset.question = question;

      chip.addEventListener('click', () => {
        if (this.onQuestionClick) {
          this.onQuestionClick(question);
        }
      });

      chipsContainer.appendChild(chip);
    });

    container.appendChild(title);
    container.appendChild(chipsContainer);

    this.element = container;
    return container;
  }

  mount(parentElement) {
    if (!this.element) {
      this.render();
    }
    parentElement.appendChild(this.element);
  }
}
