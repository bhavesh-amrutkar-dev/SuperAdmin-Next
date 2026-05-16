import { useListActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Activity() {
  const { data: activity, isLoading } = useListActivity({ limit: 100 });

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between shrink-0">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Activity Feed</h1>
           <p className="text-muted-foreground mt-1">Platform-wide audit log of all events and changes.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : activity?.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">No activity recorded yet.</div>
          ) : (
            <div className="space-y-6 border-l-2 border-muted ml-4 pl-6 relative">
              {activity?.map((item, i) => (
                <div key={item.id} className="relative">
                  <div className={`absolute -left-[31px] w-3 h-3 rounded-full ring-4 ring-card ${
                    item.action === 'created' ? 'bg-green-500' :
                    item.action === 'deleted' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-sm flex flex-wrap items-center gap-1.5">
                         <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.action === 'created' ? 'bg-green-500/10 text-green-500' :
                            item.action === 'deleted' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                         }`}>
                           {item.action}
                         </span>
                         <span className="text-muted-foreground">{item.entityType}</span>
                         <span className="font-medium text-foreground">{item.entityName}</span>
                         {item.projectId && (
                            <>
                              <span className="text-muted-foreground text-xs mx-1">in project</span>
                              <span className="font-mono text-xs text-foreground">#{item.projectId}</span>
                            </>
                         )}
                       </p>
                       <span className="text-xs text-muted-foreground font-mono shrink-0">
                         {new Date(item.createdAt).toLocaleString()}
                       </span>
                    </div>
                    <p className="text-sm text-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
