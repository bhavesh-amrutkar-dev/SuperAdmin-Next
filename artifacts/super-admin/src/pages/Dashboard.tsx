import { useGetStatsOverview, useGetProjectStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2, Users, Database, Activity, LayoutDashboard, BarChart3 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: projectStats, isLoading: projectStatsLoading } = useGetProjectStats();

  return (
    <div className="space-y-6 flex-1">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
             <Card key={i}><CardHeader className="pb-2"><Skeleton className="h-4 w-20" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              <FolderGit2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats?.activeProjects || 0} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Collections</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCollections || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats?.totalRecords || 0} records</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.recentActivity || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">in the last 24h</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-[400px]">
        <Card className="col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Project Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
             {projectStatsLoading ? (
               <Skeleton className="w-full h-full" />
             ) : (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={projectStats || []}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                   <XAxis dataKey="projectName" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                   <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}} />
                   <Bar dataKey="userCount" name="Users" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="recordCount" name="Records" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3 flex flex-col">
          <CardHeader>
             <CardTitle>Platform Status</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
             <div className="flex flex-col items-center gap-4 text-center">
                <BarChart3 className="w-16 h-16 opacity-20" />
                <p>Detailed analytics coming soon.</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
