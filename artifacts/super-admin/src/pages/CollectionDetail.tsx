import { useState } from "react";
import { 
  useGetCollection, 
  getGetCollectionQueryKey,
  useListRecords,
  getListRecordsQueryKey,
  useCreateRecord,
  useDeleteRecord,
  useUpdateRecord
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const collectionId = parseInt(id, 10);
  const queryClient = useQueryClient();

  const { data: collection, isLoading: collectionLoading } = useGetCollection(collectionId, { 
    query: { enabled: !!collectionId, queryKey: getGetCollectionQueryKey(collectionId) } 
  });

  const { data: records, isLoading: recordsLoading } = useListRecords(collectionId, {
    query: { enabled: !!collectionId, queryKey: getListRecordsQueryKey(collectionId) }
  });

  const createRecord = useCreateRecord();
  const deleteRecord = useDeleteRecord();
  const updateRecord = useUpdateRecord();

  const [open, setOpen] = useState(false);
  const [recordData, setRecordData] = useState("{\n  \n}");
  const [editId, setEditId] = useState<number | null>(null);

  const handleSave = async () => {
    try {
      JSON.parse(recordData); // validate JSON
      if (editId) {
        updateRecord.mutate({ id: editId, data: { data: recordData } }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListRecordsQueryKey(collectionId) });
            setOpen(false);
          }
        });
      } else {
        createRecord.mutate({ data: { collectionId, data: recordData } as any }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListRecordsQueryKey(collectionId) });
            setOpen(false);
          }
        });
      }
    } catch (e) {
      alert("Invalid JSON format");
    }
  };

  const openEdit = (record: any) => {
    setEditId(record.id);
    setRecordData(record.data);
    setOpen(true);
  };

  const openCreate = () => {
    setEditId(null);
    setRecordData(collection?.fields ? collection.fields : "{\n  \n}");
    setOpen(true);
  };

  const handleDelete = (recordId: number) => {
    if (confirm("Delete this record?")) {
      deleteRecord.mutate({ id: recordId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListRecordsQueryKey(collectionId) })
      });
    }
  };

  if (collectionLoading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!collection) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground">Collection not found</div>;
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center gap-4 shrink-0">
        <Link href={`/projects/${collection.projectId}`} className="p-2 rounded-md hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
           <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
           <p className="text-muted-foreground mt-1 font-mono text-sm">{collection.slug}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4"/> Add Record</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Record" : "Add New Record"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="rounded-md border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">Schema hint (if any)</p>
                <pre className="text-xs font-mono whitespace-pre-wrap">{collection.fields}</pre>
              </div>
              <Textarea 
                className="font-mono min-h-[300px]" 
                value={recordData}
                onChange={e => setRecordData(e.target.value)}
                placeholder="Enter valid JSON"
              />
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={createRecord.isPending || updateRecord.isPending}>
                  {(createRecord.isPending || updateRecord.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Record
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Collection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
               <div className="text-xs text-muted-foreground mb-1">Description</div>
               <div className="text-sm">{collection.description || "No description"}</div>
            </div>
            <div>
               <div className="text-xs text-muted-foreground mb-1">Created</div>
               <div className="text-sm">{new Date(collection.createdAt).toLocaleString()}</div>
            </div>
            <div>
               <div className="text-xs text-muted-foreground mb-2">Schema Fields Definition</div>
               <pre className="text-xs font-mono bg-muted p-2 rounded-md overflow-x-auto">
                 {collection.fields}
               </pre>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 flex flex-col min-h-[500px]">
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Data (JSON)</TableHead>
                  <TableHead className="w-[150px]">Created</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordsLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Loading records...</TableCell></TableRow>
                ) : records?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No records in this collection.</TableCell></TableRow>
                ) : (
                  records?.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-xs">{record.id}</TableCell>
                      <TableCell>
                        <div className="max-w-md max-h-24 overflow-y-auto font-mono text-xs bg-muted/50 p-2 rounded">
                          {record.data}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(record)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDelete(record.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
