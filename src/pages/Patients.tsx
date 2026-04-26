import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "../lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Patients() {
  const [search, setSearch] = useState("");
  const [patientToDelete, setPatientToDelete] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await apiFetch("/api/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    }
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      const res = await apiFetch(`/api/patients/${patientId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete patient");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setPatientToDelete(null);
    }
  });

  const confirmDelete = () => {
    if (patientToDelete) {
      deletePatientMutation.mutate(patientToDelete.id);
    }
  };

  const filteredPatients = patients?.filter((p: any) => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <Link to="/register-patient">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Patient
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search patients..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading patients...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient: any) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.first_name} {patient.last_name}
                    </TableCell>
                    <TableCell>{new Date(patient.date_of_birth).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{patient.gender}</TableCell>
                    <TableCell>{patient.contact_number}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link to={`/patients/${patient.id}`}>
                        <Button variant="outline" size="sm">View Record</Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setPatientToDelete(patient)}
                        disabled={deletePatientMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No patients found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the patient record for{" "}
              <span className="font-semibold text-gray-900">
                {patientToDelete?.first_name} {patientToDelete?.last_name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPatientToDelete(null)} disabled={deletePatientMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deletePatientMutation.isPending}>
              {deletePatientMutation.isPending ? "Deleting..." : "Delete Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
