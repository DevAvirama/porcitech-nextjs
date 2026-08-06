import Card from '../../../components/ui/Card.jsx'
import Table from '../../../components/ui/Table.jsx'

const columns = [
  { key: 'title', header: 'Actividad' },
  { key: 'meta', header: 'Momento' },
  { key: 'area', header: 'Ubicacion' },
]

function RecentActivityTable({ rows }) {
  return (
    <Card>
      <h3 className="text-2xl font-black text-slate-950">Actividad reciente</h3>
      <div className="mt-6">
        <Table columns={columns} rows={rows} />
      </div>
    </Card>
  )
}

export default RecentActivityTable
