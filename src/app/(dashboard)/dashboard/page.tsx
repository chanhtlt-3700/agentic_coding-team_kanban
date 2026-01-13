import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CreateBoardModal from '@/components/CreateBoardModal';
import BoardCard from '@/components/BoardCard';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<{
      id: string;
      name: string | null;
      email: string;
      avatar_url: string | null;
    }>();

  const { data: boards } = await supabase
    .from('boards')
    .select(
      `
      *,
      owner:profiles!boards_owner_id_fkey(id, name, email, avatar_url)
    `
    )
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Team Kanban</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {profile?.name || user.email}
              </span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Your Boards</h2>
          <CreateBoardModal />
        </div>

        {boards && boards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board: any) => (
              <BoardCard key={board.id} board={board as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              No boards yet. Create your first board to get started!
            </p>
            <CreateBoardModal />
          </div>
        )}
      </main>
    </div>
  );
}
