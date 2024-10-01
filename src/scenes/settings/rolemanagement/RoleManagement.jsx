import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputAdornment, InputLabel, ListSubheader, MenuItem, Select, Snackbar, Stack, TextField, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Header from '../../../components/Header'
import { tokens } from '../../../theme';
import { Add, EditOutlined, MenuBook, Save, Search, VerifiedUser } from '@mui/icons-material';
import CBS_Services from '../../../services/api/GAV_Sercives';
import { useSelector } from 'react-redux';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { LoadingButton } from '@mui/lab';
import { Formik } from 'formik';
import * as yup from "yup";

const RoleManagement = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isNonMobile = useMediaQuery("(min-width:600px)");

    const [roleData, setRoleData] = React.useState([])
    const [loading, setLoading] = useState(false);
    const [CatalogData, setCatalogData] = useState([]);
    const [showModal, setShowModal] = React.useState(false)
    const [showAssignRoleModal, setShowAssignRoleModal] = React.useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
    const [selectedRow, setSelectedRow] = useState(null);



    const [assignRoleData, setAssignRoleData] = React.useState(
        {
            id: 0,
            tagName: '',
            roleName: '',
            creationDate: '',
            serviceTags: ''
        }
    )
    const [formData, setFormData] = React.useState(
        {
            id: 0,
            roleName: '',
            creationDate: '',
        }
    )
    const [searchTerm, setSearchTerm] = useState('')
    const userData = useSelector((state) => state.users);
    const token = userData.token;

    console.log("yserss", userData);

    const handleToggleRoleModal = () => {
        setFormData({
            id: 0,
            roleName: '',
            creationDate: '',

        });
        setShowModal(!showModal);
    };

    console.log("form", formData);

    const handleToggleAssignRoleModal = () => {

        setShowAssignRoleModal(!showAssignRoleModal);
    };

    console.log('assignRoleData', assignRoleData);

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 80;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    const fetchRoleData = async () => {

        try {
            const response = await CBS_Services('GATEWAY', 'role/getAllRole', 'GET', null, token);
            console.log("fetchresponse=====", response);

            if (response && response.status === 200) {
                setRoleData(response.body.data || null);
                // setSuccessMessage('');
                // setErrorMessage('');
            } else {
                showSnackbar('Error Finding Data.', 'error');
            }

        } catch (error) {
            console.log('Error:', error);
        }

    }

    const handleConfirmAddRole = async () => {
        setLoading(true);
        try {
            const response = await CBS_Services('GATEWAY', `role/createRole`, 'POST', formData, token);

            console.log("response", response);
            if (response && response.status === 200) {
                handleToggleRoleModal();
                await fetchRoleData();
                showSnackbar('Role created successfully.', 'success');

            } else if (response && response.status === 401) {
                showSnackbar(response.body.errors || 'Unauthorized to perform action', 'error');
            }

            else {
                showSnackbar(response.body.errors || 'Error Adding Role', 'error');

            }
        } catch (error) {
            console.error('Error:', error);
            showSnackbar('Network Error!!! Try again Later.', 'error');
        }

        setLoading(false);
    };


    const handleConfirmAssignRole = async () => {
        setLoading(true);
        try {
            const payload = {
                tagName: assignRoleData.tagName,
                roleName: selectedRow,
            };

            const response = await CBS_Services('GATEWAY', `role/addRoleToService`, 'POST', payload, token);
            console.log("assignroleform", payload);
            console.log("responseassign", response);

            if (response && response.status === 200) {
                showSnackbar('Role assigned successfully.', 'success');
                handleToggleAssignRoleModal();
                await fetchRoleData();
            } else {
                showSnackbar(response.body.errors || 'Error assigning role', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showSnackbar('Network Error! Try again later.', 'error');
        }

        setLoading(false);
    };


    // Function to fetch Catalog data
    const fetchCatalogData = async () => {
        try {

            const payload = {
                serviceReference: 'GET_ALL_CATALOG',
                requestBody: ''
            }
            // const response = await CBS_Services('GATEWAY', 'gavClientApiService/request', 'POST', payload, token);
            const response = await CBS_Services('APE', 'catalog/get/all', 'GET');

            console.log("response", response);

            if (response && response.status === 200) {
                setCatalogData(response.body.data);
            } else {
                console.error('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    useEffect(() => {
        fetchRoleData();
        fetchCatalogData()
    }, []);

    console.log("selectedrow", selectedRow);


    // const handleAssignUserRole = (assignrole) => {
    //     setSelectedRow(assignrole);
    //     setShowAssignRoleModal(!showAssignRoleModal);
    // };
    const handleAssignUserRole = (assignrole) => {
        setSelectedRow(assignrole);
        setAssignRoleData({
            ...assignRoleData,
            roleName: assignrole,
            tagName: '',  // Reset tagName when opening the modal
        });
        setShowAssignRoleModal(!showAssignRoleModal);
    };


    const columns = [
        { field: "id", headerName: "ID", flex: 1 },
        { field: "roleName", headerName: "Role", flex: 1 },
        { field: "creationDate", headerName: "Creation Date", flex: 1 },

        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            renderCell: (params) => {
                const row = params.row;
                return (
                    <>
                        <Box
                            width="30%"
                            m="0 4px"
                            p="5px"
                            display="flex"
                            justifyContent="center"
                            backgroundColor={colors.greenAccent[600]}
                            borderRadius="4px"
                            onClick={() => handleAssignUserRole(row.roleName)}
                        >
                            <VerifiedUser />
                        </Box>
                        {/* <Box
                            width="30%"
                            m="0"
                            p="5px"
                            display="flex"
                            justifyContent="center"
                            backgroundColor={colors.redAccent[600]}
                            borderRadius="4px"
                        >
                            <Delete />
                        </Box> */}
                    </>
                );
            },
        },
    ];

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Role Management" subtitle="Manage your roles" />
                <Box>
                    <Button
                        sx={{
                            backgroundColor: colors.blueAccent[700],
                            color: colors.grey[100],
                            fontSize: "14px",
                            fontWeight: "bold",
                            padding: "10px 20px",
                            marginRight: "10px",
                        }}
                        onClick={handleToggleRoleModal}
                    >
                        <Add sx={{ mr: "10px" }} />
                        Add Role
                    </Button>

                </Box>
            </Box>


            <Box
                m="40px 15px 15px 15px"
                height="70vh"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none",
                    },
                    "& .name-column--cell": {
                        color: colors.greenAccent[300],
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.blueAccent[700],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.grey[100]} !important`,
                    },
                }}
            >
                <DataGrid
                    rows={roleData}
                    columns={columns}
                    components={{ Toolbar: GridToolbar }}
                    checkboxSelection
                    disableSelectionOnClick
                    loading={loading}
                    setFieldValue
                />
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Dialog open={showModal} onClose={handleToggleRoleModal} fullWidth>
                <DialogTitle>Add Role</DialogTitle>
                <DialogContent>

                    <Formik
                        onSubmit={handleConfirmAddRole}
                        initialValues={formData}
                        enableReinitialize={true}
                        validationSchema={checkoutSchema}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleBlur,
                            handleChange,
                            handleSubmit,
                            setFieldValue
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box
                                    display="grid"
                                    gap="30px"
                                    gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                                    sx={{
                                        "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                                    }}
                                >

                                    <TextField
                                        fullWidth
                                        variant="filled"
                                        type="text"
                                        label="Role Name"
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setFieldValue("roleName", e.target.value);
                                            setFormData({ ...formData, roleName: e.target.value });
                                        }}
                                        value={values.roleName}
                                        name="roleName"
                                        error={!!touched.roleName && !!errors.roleName}
                                        helperText={touched.roleName && errors.roleName}
                                        sx={{ gridColumn: "span 4" }}
                                    />

                                </Box>
                            </form>
                        )}
                    </Formik>
                </DialogContent>
                <DialogActions>
                    <Box display="flex" justifyContent="end" mt="20px">
                        <Stack direction="row" spacing={2}>

                            <LoadingButton type="submit" color="secondary" variant="contained" loading={loading} loadingPosition="start"
                                startIcon={<Save />} onClick={handleConfirmAddRole}>
                                Add
                            </LoadingButton>

                            <Button color="primary" variant="contained" disabled={loading} onClick={handleToggleRoleModal}>
                                Cancel
                            </Button>
                        </Stack>
                    </Box>
                </DialogActions>
            </Dialog>
            <Dialog open={showAssignRoleModal} onClose={handleToggleAssignRoleModal} fullWidth >
                <DialogTitle>Assign Role</DialogTitle>
                <DialogContent>

                    <Formik
                        onSubmit={handleConfirmAssignRole}
                        initialValues={assignRoleData}
                        enableReinitialize={true}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleBlur,
                            handleChange,
                            handleSubmit,
                            setFieldValue
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Box
                                    display="grid"
                                    gap="30px"
                                    gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                                    sx={{
                                        "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                                    }}
                                >


                                    <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
                                        <InputLabel>Menu</InputLabel>
                                        <Select
                                            label="Menu"
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("tagName", e.target.value);
                                                setAssignRoleData({ ...assignRoleData, tagName: e.target.value });
                                            }}
                                            value={values.tagName}
                                            name="tagName"
                                            error={!!touched.tagName && !!errors.tagName}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <MenuBook />
                                                </InputAdornment>
                                            }
                                            MenuProps={MenuProps}
                                        >
                                            <ListSubheader>
                                                <TextField
                                                    size="small"
                                                    autoFocus
                                                    placeholder="Type to search..."
                                                    fullWidth
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Search />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key !== 'Escape') {
                                                            e.stopPropagation();
                                                        }
                                                    }}
                                                />
                                            </ListSubheader>
                                            <MenuItem value="">
                                                <em>Select Menu</em>
                                            </MenuItem>
                                            {Array.isArray(CatalogData) && CatalogData.length > 0 ? (
                                                CatalogData.filter(option =>
                                                    option.id.toLowerCase().includes(searchTerm.toLowerCase())
                                                ).map(option => (
                                                    <MenuItem key={option.id} value={option.id}>
                                                        {option.id}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem value="">No Menu available</MenuItem>
                                            )}
                                        </Select>
                                        {touched.tagName && errors.tagName && (
                                            <Alert severity="error">{errors.tagName}</Alert>
                                        )}
                                    </FormControl>

                                </Box>

                            </form>
                        )}
                    </Formik>


                </DialogContent>
                <DialogActions>
                    <Box display="flex" justifyContent="end" mt="20px">
                        <Stack direction="row" spacing={2}>

                            <LoadingButton type="submit" color="secondary" variant="contained" loading={loading} loadingPosition="start"
                                startIcon={<VerifiedUser />} onClick={handleConfirmAssignRole}>
                                Assign
                            </LoadingButton>

                            <Button color="primary" variant="contained" disabled={loading} onClick={handleToggleAssignRoleModal}>
                                Cancel
                            </Button>
                        </Stack>
                    </Box>
                </DialogActions>
            </Dialog>

        </Box>
    )
}

const checkoutSchema = yup.object().shape({
    roleName: yup.string().required("required"),

});

export default RoleManagement
