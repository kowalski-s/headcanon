import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HeroLead } from '@/components/desk/HeroLead';

const meta: Meta<typeof HeroLead> = {
  title: 'Desk/HeroLead',
  component: HeroLead,
  parameters: { layout: 'padded', nextjs: { appDirectory: true } },
};

export default meta;
type Story = StoryObj<typeof HeroLead>;

export const Filled: Story = {
  args: {
    kicker: 'вт · поздняя ночь · свеча горит',
    lead: 'Три ночи назад ты оставила «Пепел и мята» — глава 7 ждёт.',
    continueHref: '/write/s1?ch=7',
    continueLabel: 'продолжить гл. 7',
  },
};

export const NoCta: Story = {
  args: {
    kicker: 'вт · поздняя ночь · свеча горит',
    lead: 'Сегодня ты уже была за столом — глава 7 ждёт продолжения.',
    continueHref: null,
    continueLabel: null,
  },
};
