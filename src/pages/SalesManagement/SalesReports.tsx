// File: src/pages/SalesManagement/components/SalesReports.tsx
import React from 'react';
import { Card, Row, Col, DatePicker, Select, Button } from 'antd';
import { Download, Filter } from 'lucide-react';

export const SalesReports: React.FC = () => {
    return (
        <div className="space-y-4">
            {/* Report Filters */}
            <Card>
                <Row gutter={16} align="middle">
                    <Col>
                        <DatePicker.RangePicker />
                    </Col>
                    <Col>
                        <Select
                            placeholder="Payment Method"
                            style={{ width: 150 }}
                            options={[
                                { value: 'all', label: 'All Methods' },
                                { value: 'cash', label: 'Cash' },
                                { value: 'card', label: 'Card' },
                                { value: 'digital', label: 'Digital' },
                            ]}
                        />
                    </Col>
                    <Col>
                        <Select
                            placeholder="Report Type"
                            style={{ width: 180 }}
                            options={[
                                { value: 'sales', label: 'Sales Summary' },
                                { value: 'products', label: 'Product Performance' },
                                { value: 'customer', label: 'Customer Analysis' },
                                { value: 'returns', label: 'Returns Analysis' },
                            ]}
                        />
                    </Col>
                    <Col>
                        <Button type="primary" icon={<Filter size={16} />}>
                            Generate Report
                        </Button>
                    </Col>
                    <Col flex="auto" className="text-right">
                        <Button icon={<Download size={16} />}>
                            Export Report
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Report Charts Placeholder */}
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Sales Trend" className="h-80">
                        <div className="flex items-center justify-center h-48 text-gray-500">
                            Sales Chart will be displayed here
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Top Products" className="h-80">
                        <div className="flex items-center justify-center h-48 text-gray-500">
                            Products Chart will be displayed here
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Payment Methods" className="h-80">
                        <div className="flex items-center justify-center h-48 text-gray-500">
                            Payment Methods Chart will be displayed here
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Returns Analysis" className="h-80">
                        <div className="flex items-center justify-center h-48 text-gray-500">
                            Returns Chart will be displayed here
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};