import React from 'react';
import { Company } from '@/types/stockGame';
import CompanyCard from '@/components/elements/CompanyCard';

type Props = {
    companies: Company[];
    onBuy: (company: Company) => void;
    onSell: (company: Company) => void;
    isStarted: boolean;
    isAfterHours: boolean;
};

const CompanyList = ({
    companies,
    onBuy,
    onSell,
    isStarted,
    isAfterHours
}: Props) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {companies.map(company => (
            <CompanyCard
                key={company.id}
                company={company}
                onBuy={() => onBuy(company)}
                onSell={() => onSell(company)}
                isStarted={isStarted}
                isAfterHours={isAfterHours}
            />
        ))}
    </div>
);

export default CompanyList;
