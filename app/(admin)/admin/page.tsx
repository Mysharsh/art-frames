export default function AdminPage() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Revenue</h3>
                    <p className="text-3xl font-bold">$0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Products</h3>
                    <p className="text-3xl font-bold">24</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Admin Features (Coming Soon)</h2>
                <ul className="space-y-2 text-gray-600">
                    <li>• Orders Management</li>
                    <li>• Product Management</li>
                    <li>• Customer Management</li>
                    <li>• Analytics Dashboard</li>
                </ul>
            </div>
        </div>
    )
}
