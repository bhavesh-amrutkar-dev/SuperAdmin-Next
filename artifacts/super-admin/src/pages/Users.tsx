import { useState } from "react";
import { 
  useListUsers, 
  useCreateUser, 
  getListUsersQueryKey, 
  useDeleteUser,
  useListProjects
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Users() {
  const { data: users, isLoading } = useListUsers();
  const { data: projects } = useListProjects();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    role: "viewer" as any, 
    status: "active" as any,
    projectId: "none"
  });

  const filteredUsers = users?.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      projectId: formData.projectId === "none" ? undefined : parseInt(formData.projectId, 10)
    };
    
    createUser.mutate({ data: payload }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        setOpen(false);
        setFormData({ name: "", email: "", role: "viewer", status: "active", projectId: "none" });
      }
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        }
      });
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Users</h1>
           <p className="text-muted-foreground mt-1">Manage platform administrators and assigned project members.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
             <Button className="gap-2 shadow-sm"><Plus className="w-4 h-4"/> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                 <Label>Full Name</Label>
                 <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" required />
              </div>
              <div className="space-y-2">
                 <Label>Email</Label>
                 <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@example.com" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={formData.role} onValueChange={(v: any) => setFormData({...formData, role: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                 <Label>Assign to Project (Optional)</Label>
                 <Select value={formData.projectId} onValueChange={(v) => setFormData({...formData, projectId: v})}>
                    <SelectTrigger><SelectValue placeholder="Select a project..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Project (Global)</SelectItem>
                      {projects?.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              <div className="flex justify-end pt-2">
                 <Button type="submit" disabled={createUser.isPending}>
                   {createUser.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                   Create User
                 </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
           <Search className="w-4 h-4 text-muted-foreground" />
           <Input 
             placeholder="Search users by name or email..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="border-0 shadow-none focus-visible:ring-0 px-0 h-8"
           />
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Project Assigned</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Loading users...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No users found.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="group hover:bg-muted/50 transition-colors">
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0 font-medium">
                             {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <div className="font-medium">{user.name}</div>
                             <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>
                         {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.projectId ? (
                        <span className="text-foreground font-medium">{projects?.find(p => p.id === user.projectId)?.name || `Project #${user.projectId}`}</span>
                      ) : (
                        <span className="text-muted-foreground italic">Global</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                       {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="opacity-0 group-hover:opacity-100 hover:text-destructive">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
