import { DashboardSection } from "@/components/dashboard/section"
import { TodoRow } from "@/components/dashboard/todo-row"
import type { Todo } from "@/lib/data/dashboard"

export function TodosSection({ todos }: { todos: Todo[] }) {
  const openCount = todos.filter((t) => !t.completed).length

  return (
    <DashboardSection title="MY TO-DOS" count={openCount}>
      {todos.length === 0 ? (
        <div className="flex min-h-[80px] items-center justify-center rounded-md border bg-muted/40 text-sm text-muted-foreground">
          You have no to-dos
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <th className="w-8 py-2 pl-4"></th>
                <th className="py-2 pr-4">To-Do</th>
                <th className="w-10 py-2 text-center">Notes</th>
                <th className="w-24 py-2">Due Date</th>
                <th className="w-10 py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {todos.map((todo) => (
                <TodoRow key={todo.id} todo={todo} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardSection>
  )
}
