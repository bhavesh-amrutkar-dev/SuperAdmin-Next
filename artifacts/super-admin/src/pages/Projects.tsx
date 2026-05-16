import { useState } from "react";
import { useListProjects, useCreateProject, getListProjectsQueryKey, useDeleteProject } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FolderGit2, Plus, Search, MoreHorizontal, Loader2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({ name: "", slug: "", description: "" });

  const filteredProjects = projects?.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase())) || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({ data: { name: formData.name, slug: formData.slug, description: formData.description, status: "active" as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        setOpen(false);
        setFormData({ name: "", slug: "", description: "" });
      }
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
           <p className="text-muted-foreground mt-1">Manage platform projects and tenants.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
             <Button className="gap-2 shadow-sm"><Plus className="w-4 h-4"/> New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                 <Label>Project Name</Label>
                 <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Acme Corp" required />
              </div>
              <div className="space-y-2">
                 <Label>Slug</Label>
                 <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="acme-corp" required />
              </div>
              <div className="space-y-2">
                 <Label>Description</Label>
                 <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Main tenant project" />
              </div>
              <div className="flex justify-end pt-2">
                 <Button type="submit" disabled={createProject.isPending}>
                   {createProject.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                   Create Project
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
             placeholder="Search projects..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="border-0 shadow-none focus-visible:ring-0 px-0 h-8"
           />
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Loading projects...</TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No projects found.</TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id} className="group cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                             {project.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             {project.name}
                             <div className="text-xs text-muted-foreground font-normal line-clamp-1">{project.description || "No description"}</div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{project.slug}</TableCell>
                    <TableCell>
                      <Badge variant={project.status === "active" ? "default" : "secondary"}>
                         {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                       {new Date(project.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                       <Link href={`/projects/${project.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 opacity-0 group-hover:opacity-100">
                          <ArrowRight className="h-4 w-4" />
                       </Link>
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
