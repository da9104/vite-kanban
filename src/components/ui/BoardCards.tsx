
interface Board {
  id: string;
  name: string;
  columns?: { id: string; name: string; tasks: any[] }[]; // Assuming columns have at least id, name, and tasks
  created_at: string;
  user_id: string;
}

interface BoardCardsProps {
  boards: Board[];
  handleClick: (boardId: string) => void;
  getOwnerName: (userId?: string) => string;
}


export function BoardCards({ boards, handleClick, getOwnerName }: BoardCardsProps) {
  return (
    <div className="w-full mx-auto max-w-full rounded-lg bg-card uppercase">
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-2 "
      >
        {boards.map((board, index) => (
          <div
            key={board.id}
            className="flex flex-col p-8! gap-4 border border-gray-200 rounded-xl duration-300 ease-in-out hover:shadow-md hover:translate-x-0.5"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 text-sm text-muted-foreground">
                {index + 1}
              </span>
              <h3 className="font-semibold text-foreground text-[#635fc7]">{board.name}</h3>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed flex-1 text-gray-600">
              {board.columns?.length || 0} Columns
            </p>

            <p className="text-xs text-gray-600">
              <span> {getOwnerName(board.user_id)} </span>
              {new Date(board.created_at).toLocaleDateString()}
            </p> 

            <button
              onClick={() => board.id && handleClick(board.id)}
              className="w-full py-4  bg-transparent text-xs border border-[#635fc7] hover:bg-[#635fc7]/40! cursor-pointer rounded uppercase">
               View board
            </button>
          </div>
        ))}

        {boards.length === 0 && (
          <p className="text-[#828fa3]">No boards found in the database.</p>
        )}
      </div>
    </div>
  );
}



export { BoardCards as default }