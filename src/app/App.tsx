import { ThemeProvider } from './providers/ThemeProvider';
import { TaskBoard } from '../features/tasks/components/TaskBoard';
import { useTasksStore } from '../features/tasks/model/useTasksStore';

export function App() {
  const theme = useTasksStore((state) => state.settings.theme);

  return (
    <ThemeProvider theme={theme}>
      <TaskBoard />
    </ThemeProvider>
  );
}
