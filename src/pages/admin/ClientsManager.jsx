import { useEffect, useState } from 'react';
import { FiTrash2, FiShield, FiUser, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getAdminUsers, updateUserRole, deleteUser } from '@/services/admin.service';
import { formatDate, cn } from '@/lib/utils';

export default function ClientsManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    getAdminUsers()
      .then((d) => setUsers(d.users ?? []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(userId, role) {
    try {
      await updateUserRole({ userId, role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      toast.success('Роль обновлена');
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleDelete(userId, name) {
    if (!window.confirm(`Удалить пользователя «${name}»? Это действие нельзя отменить.`)) return;
    try {
      await deleteUser({ userId });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('Пользователь удалён');
    } catch (e) {
      toast.error(e.message);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary">Клиенты</h1>
          <p className="mt-1 text-sm text-text-muted">
            Всего: {users.length} пользователей
          </p>
        </div>
        <input
          type="search"
          placeholder="Поиск по имени, email, телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-bg-dark bg-white px-4 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent md:w-72"
        />
      </div>

      <div className="rounded-2xl border border-bg-dark bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-muted">
            {search ? 'Ничего не найдено' : 'Пользователей нет'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-bg-dark bg-bg text-left text-xs text-text-muted">
                  <th className="px-4 py-3">Пользователь</th>
                  <th className="px-4 py-3">Телефон</th>
                  <th className="px-4 py-3">Роль</th>
                  <th className="px-4 py-3">Верифицирован</th>
                  <th className="px-4 py-3">Броней</th>
                  <th className="px-4 py-3">Регистрация</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="border-b border-bg-dark last:border-0 hover:bg-bg">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {u.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-text">
                              {u.name || '-'}
                              {isSelf && (
                                <span className="ml-1.5 rounded-full bg-accent/20 px-1.5 py-0.5 text-xs text-accent">
                                  Вы
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{u.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={cn(
                            'rounded-lg border px-2 py-1 text-xs font-medium outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50',
                            u.role === 'admin'
                              ? 'border-accent/30 bg-accent/10 text-accent'
                              : 'border-bg-dark bg-white text-text-muted',
                          )}
                        >
                          <option value="user">Гость</option>
                          <option value="admin">Администратор</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {u.is_verified ? (
                          <span className="flex items-center gap-1 text-success">
                            <FiCheckCircle className="h-4 w-4" />
                            <span className="text-xs">Да</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-text-muted">
                            <FiXCircle className="h-4 w-4" />
                            <span className="text-xs">Нет</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary">
                          {u.bookings_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {u.created_at ? formatDate(u.created_at) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleDelete(u.id, u.name)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-error/10 hover:text-error disabled:cursor-not-allowed disabled:opacity-30"
                          title="Удалить пользователя"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
