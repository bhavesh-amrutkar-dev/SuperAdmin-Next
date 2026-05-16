import { useState } from "react";
import { 
  useGetProject, 
  getGetProjectQueryKey,
  useUpdateProject, 
  useDeleteProject,
  useListCollections,
  getListCollectionsQueryKey,
  useCreateCollection,
  useListUsers,
  useListActivity
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, Database, Users, ActivitySquare, Settings, Save, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id, 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useGetProject(projectId, { 
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) } 
  });

  const { data: collections, isLoading: collectionsLoading } = useListCollections(projectId, {
    query: { enabled: !!projectId, queryKey: getListCollectionsQueryKey(projectId) }
  });

  const { data: users, isLoading: usersLoading } = useListUsers({ projectId }, {
    query: { enabled: !!projectId }
  });

  const { data: activity, isLoading: activityLoading } = useListActivity({ projectId }, {
    query: { enabled: !!projectId }
  });

  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createCollection = useCreateCollection();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", status: "active" as any });
  
  const [collectionForm, setCollectionForm] = useState({ name: "", slug: "", description: "", fields: "[]" });
  const [collectionOpen, setCollectionOpen] = useState(false);

  const startEdit = () => {
    if (project) {
      setFormData({
        name: project.name,
        slug: project.slug,
        description: project.description || "",
        status: project.status
      });
      setEditMode(true);
    }
  };

  const handleUpdate = async () => {
    updateProject.mutate({ id: projectId, data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
        setEditMode(false);
      }
    });
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProject.mutate({ id: projectId }, {
        onSuccess: () => {
          setLocation("/projects");
        }
      });
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    createCollection.mutate({ 
      data: { 
        name: collectionForm.name, 
        slug: collectionForm.slug, 
        description: collectionForm.description,
        fields: collectionForm.fields || "[]"
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCollectionsQueryKey(projectId) });
        setCollectionOpen(false);
        setCollectionForm({ name: "", slug: "", description: "", fields: "[]" });
      }
    });
  };

  if (projectLoading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!project) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground">Project not found</div>;
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center gap-4 shrink-0">
        <Link href="/projects" className="p-2 rounded-md hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
           <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
             {project.name}
             <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
           </h1>
           <p className="text-muted-foreground mt-1 font-mono text-sm">{project.slug}</p>
        </div>
      </div>

      <Tabs defaultValue="collections" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent shrink-0">
          <TabsTrigger value="collections" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-6 py-3 font-medium">
             <Database className="w-4 h-4 mr-2" /> Collections
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-6 py-3 font-medium">
             <Users className="w-4 h-4 mr-2" /> Users
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-6 py-3 font-medium">
             <ActivitySquare className="w-4 h-4 mr-2" /> Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-6 py-3 font-medium">
             <Settings className="w-4 h-4 mr-2" /> Settings
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto pt-6">
          <TabsContent value="collections" className="m-0 h-full">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Data Collections</h2>
                <Dialog open={collectionOpen} onOpenChange={setCollectionOpen}>
                  <DialogTrigger asChild>
                     <Button size="sm"><Database className="w-4 h-4 mr-2"/> New Collection</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Collection</DialogTitle>
                      <DialogDescription>Define a new data schema for this project.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCollection} className="space-y-4 pt-4">
                      <div className="space-y-2">
                         <Label>Collection Name</Label>
                         <Input value={collectionForm.name} onChange={e => setCollectionForm({...collectionForm, name: e.target.value})} placeholder="Posts" required />
                      </div>
                      <div className="space-y-2">
                         <Label>Slug</Label>
                         <Input value={collectionForm.slug} onChange={e => setCollectionForm({...collectionForm, slug: e.target.value})} placeholder="posts" required />
                      </div>
                      <div className="space-y-2">
                         <Label>Description</Label>
                         <Input value={collectionForm.description} onChange={e => setCollectionForm({...collectionForm, description: e.target.value})} placeholder="Blog posts" />
                      </div>
                      <div className="flex justify-end pt-2">
                         <Button type="submit" disabled={createCollection.isPending}>
                           {createCollection.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                           Create Collection
                         </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
             </div>
             
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {collectionsLoading ? (
                  <div className="col-span-full text-center text-muted-foreground py-8">Loading collections...</div>
                ) : collections?.length === 0 ? (
                  <div className="col-span-full text-center text-muted-foreground py-12 border border-dashed rounded-lg">
                     No collections found. Create one to get started.
                  </div>
                ) : (
                  collections?.map(col => (
                    <Link key={col.id} href={`/collections/${col.id}`}>
                      <Card className="hover:border-primary/50 cursor-pointer transition-colors group h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {col.name}
                            <Database className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </CardTitle>
                          <CardDescription className="font-mono text-xs">{col.slug}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">{col.description || "No description provided."}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
             </div>
          </TabsContent>

          <TabsContent value="users" className="m-0 h-full">
             <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8">Loading users...</TableCell></TableRow>
                    ) : users?.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No users assigned to this project.</TableCell></TableRow>
                    ) : (
                      users?.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                          <TableCell><Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
             </Card>
          </TabsContent>

          <TabsContent value="activity" className="m-0 h-full">
             <Card>
                <div className="p-6">
                  {activityLoading ? (
                    <div className="text-center text-muted-foreground">Loading activity...</div>
                  ) : activity?.length === 0 ? (
                    <div className="text-center text-muted-foreground">No recent activity.</div>
                  ) : (
                    <div className="space-y-4 border-l-2 border-muted ml-3 pl-6">
                      {activity?.map(item => (
                        <div key={item.id} className="relative">
                          <div className="absolute -left-[31px] w-3 h-3 bg-primary rounded-full ring-4 ring-card" />
                          <div className="flex justify-between items-start">
                             <div>
                               <p className="text-sm">
                                 <span className="font-medium text-foreground capitalize">{item.action}</span>
                                 <span className="text-muted-foreground mx-1">{item.entityType}</span>
                                 <span className="font-medium">{item.entityName}</span>
                               </p>
                               <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                             </div>
                             <span className="text-xs text-muted-foreground shrink-0">{new Date(item.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="settings" className="m-0 h-full max-w-2xl">
             <Card>
                <CardHeader>
                  <CardTitle>Project Settings</CardTitle>
                  <CardDescription>Update your project details and status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {editMode ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Project Name</Label>
                        <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleUpdate} disabled={updateProject.isPending}>
                          {updateProject.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
                        <div className="text-sm text-muted-foreground">Project Name</div>
                        <div className="col-span-2 font-medium">{project.name}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
                        <div className="text-sm text-muted-foreground">Slug</div>
                        <div className="col-span-2 font-mono text-sm">{project.slug}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
                        <div className="text-sm text-muted-foreground">Description</div>
                        <div className="col-span-2">{project.description || "—"}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-b border-border pb-4">
                        <div className="text-sm text-muted-foreground">Created</div>
                        <div className="col-span-2">{new Date(project.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="pt-4">
                        <Button onClick={startEdit} variant="outline"><Settings className="w-4 h-4 mr-2" /> Edit Project</Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-8 border-t border-border">
                    <h3 className="text-lg font-medium text-destructive mb-2">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">Deleting this project will also delete all its collections, records, and remove assigned users. This action is irreversible.</p>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleteProject.isPending}>
                       {deleteProject.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                       Delete Project
                    </Button>
                  </div>
                </CardContent>
             </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
