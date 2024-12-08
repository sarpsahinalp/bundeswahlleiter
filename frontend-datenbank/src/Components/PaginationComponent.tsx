import React from "react";
import { Box, Pagination } from "@mui/material";

interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationProps> = ({
                                                            totalItems,
                                                            itemsPerPage,
                                                            currentPage,
                                                            onPageChange,
                                                        }) => {
    const pageCount = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        onPageChange(page);
    };

    return (
        <Box display="flex" justifyContent="center" marginTop={2}>
            <Pagination
                count={pageCount}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
            />
        </Box>
    );
};

export default PaginationComponent;
