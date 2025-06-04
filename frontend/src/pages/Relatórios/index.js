import React, { Fragment, useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  Paper,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Table,
  makeStyles,
  Badge,
} from '@material-ui/core';
import * as XLSX from 'xlsx';
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import {
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Tooltip,
  Typography,
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Avatar
} from "@mui/material";
import { UsersFilter } from "../../components/UsersFilter";
import { TagsFilter } from "../../components/TagsFilter";
import { WhatsappsFilter } from "../../components/WhatsappsFilter";
import { StatusFilter } from "../../components/StatusFilter";
import useDashboard from "../../hooks/useDashboard";
import QueueSelectCustom from "../../components/QueueSelectCustom";
import moment from "moment";
import {
  Visibility as VisibilityIcon,
  SaveAlt as ExportIcon,
  FilterAlt as FilterIcon,
  Refresh as RefreshIcon,
  InsertChartOutlined as StatsIcon,
  WhatsApp as WhatsAppIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  ArrowForward as ArrowForwardIcon
} from "@mui/icons-material";
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { AuthContext } from "../../context/Auth/AuthContext";
import { isArray, capitalize } from "lodash";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  filterCard: {
    marginBottom: theme.spacing(4),
    borderRadius: 12,
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  filterCardHeader: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: '12px 12px 0 0',
  },
  tableCard: {
    borderRadius: 12,
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  tableContainer: {
    maxHeight: 'calc(100vh - 320px)',
    overflow: 'auto',
    ...theme.scrollbarStyles,
  },
  tableHead: {
    backgroundColor: theme.palette.primary.light,
    '& th': {
      color: theme.palette.primary.contrastText,
      fontWeight: 'bold',
    },
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: 20,
    fontWeight: 'bold',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
  },
  openStatus: {
    backgroundColor: '#e3f2fd',
    color: theme.palette.primary.dark,
  },
  pendingStatus: {
    backgroundColor: '#fff8e1',
    color: '#ff8f00',
  },
  closedStatus: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  actionButton: {
    margin: theme.spacing(0.5),
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: '#f5f7fa',
    borderRadius: '0 0 12px 12px',
  },
  statsCard: {
    marginBottom: theme.spacing(3),
  },
  statsIcon: {
    fontSize: '3rem',
    color: theme.palette.primary.main,
  },
  filterButton: {
    marginLeft: theme.spacing(2),
    borderRadius: 8,
    textTransform: 'none',
    padding: '8px 16px',
  },
  exportButton: {
    backgroundColor: '#4caf50',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#388e3c',
    },
    borderRadius: 8,
    textTransform: 'none',
    padding: '8px 16px',
  },
  quickFilter: {
    marginRight: theme.spacing(1),
    borderRadius: 8,
    textTransform: 'none',
    padding: '6px 12px',
  },
  queueBadge: {
    padding: '6px 12px',
    borderRadius: 20,
    fontWeight: 'bold',
    fontSize: '0.75rem',
    backgroundColor: theme.palette.grey[200],
  },
  highlightRow: {
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.04)',
    },
  },
}));

const StatusBadge = ({ status }) => {
  const classes = useStyles();
  
  let badgeClass = '';
  switch (status) {
    case 'ABERTO':
      badgeClass = `${classes.statusBadge} ${classes.openStatus}`;
      break;
    case 'PENDENTE':
      badgeClass = `${classes.statusBadge} ${classes.pendingStatus}`;
      break;
    case 'FECHADO':
      badgeClass = `${classes.statusBadge} ${classes.closedStatus}`;
      break;
    default:
      badgeClass = classes.statusBadge;
  }
  
  return (
    <Box display="flex" alignItems="center">
      {status === 'ABERTO' && <CheckCircleIcon style={{ color: '#2196f3', marginRight: 4, fontSize: '1rem' }} />}
      {status === 'PENDENTE' && <PendingIcon style={{ color: '#ff9800', marginRight: 4, fontSize: '1rem' }} />}
      {status === 'FECHADO' && <CancelIcon style={{ color: '#f44336', marginRight: 4, fontSize: '1rem' }} />}
      <span className={badgeClass}>{status}</span>
    </Box>
  );
};

const QueueBadge = ({ queueName, queueColor }) => {
  const classes = useStyles();
  
  return (
    <span 
      className={classes.queueBadge}
      style={{ backgroundColor: queueColor || '#e0e0e0' }}
    >
      {queueName || 'SEM FILA'}
    </span>
  );
};

const ChannelIcon = ({ channel }) => {
  switch (channel) {
    case 'whatsapp':
      return <WhatsAppIcon style={{ color: '#25D366' }} />;
    default:
      return <WhatsAppIcon style={{ color: '#25D366' }} />;
  }
};

const Relatorios = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { getReport } = useDashboard();

  const initialContact = { id: "", name: "" };

  // State management
  const [currentContact, setCurrentContact] = useState(initialContact);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [queueIds, setQueueIds] = useState([]);
  const [ticketId, setTicketId] = useState('');
  const [userIds, setUserIds] = useState([]);
  const [dateFrom, setDateFrom] = useState(moment().subtract(7, 'days').format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [totalTickets, setTotalTickets] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [contacts, setContacts] = useState([initialContact]);
  const [searchParam, setSearchParam] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    pending: 0,
    closed: 0
  });

  // Load contacts
  useEffect(() => {
    const { companyId } = user;
    try {
      (async () => {
        const { data: contactList } = await api.get('/contacts/list', { params: { companyId: companyId } });
        let customList = contactList.map((c) => ({ id: c.id, name: c.name }));
        if (isArray(customList)) {
          setContacts([{ id: "", name: "" }, ...customList]);
        }
      })()
    } catch (err) {
      toastError(err);
    }
  }, [user]);

  // Set user filter for non-admin users
  useEffect(() => {
    if (user?.profile === 'user') {
      setUserIds([user.id]);
    }
  }, [user]);

  // Export to Excel function
  const exportToExcel = async () => {
    setLoading(true);
    try {
      const filterParams = {
        searchParam,
        contactId: currentContact?.id,
        whatsappId: JSON.stringify(selectedWhatsapp),
        users: JSON.stringify(userIds),
        queueIds: JSON.stringify(queueIds),
        status: JSON.stringify(selectedStatus),
        dateFrom,
        dateTo,
        page: 1,
        pageSize: 9999999,
      };

      if (ticketId) {
        filterParams.ticketId = ticketId;
      }

      const data = await getReport(filterParams);

      const ws = XLSX.utils.json_to_sheet(data.tickets);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'RelatorioDeAtendimentos');
      XLSX.writeFile(wb, `relatorio-atendimentos-${moment().format('YYYY-MM-DD')}.xlsx`);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Main filter function
  const handleFilter = async (page = 1) => {
    setLoading(true);

    try {
      const filterParams = {
        searchParam,
        contactId: currentContact?.id,
        whatsappId: JSON.stringify(selectedWhatsapp),
        users: JSON.stringify(userIds),
        queueIds: JSON.stringify(queueIds),
        status: JSON.stringify(selectedStatus),
        dateFrom,
        dateTo,
        page: page,
        pageSize: pageSize,
      };

      // Adiciona ticketId apenas se estiver preenchido
      if (ticketId) {
        filterParams.ticketId = ticketId;
      }

      const data = await getReport(filterParams);

      setTotalTickets(data.totalTickets.total);
      setHasMore(data.tickets.length === pageSize);
      setTickets(data.tickets);
      setPageNumber(page);
      
      // Update stats
      setStats({
        total: data.totalTickets.total,
        open: data.totalTickets.open,
        pending: data.totalTickets.pending,
        closed: data.totalTickets.closed
      });
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Quick filter functions
  const applyQuickFilter = (days) => {
    setDateFrom(moment().subtract(days, 'days').format("YYYY-MM-DD"));
    setDateTo(moment().format("YYYY-MM-DD"));
    handleFilter(1);
  };

  // User filter handler
  const handleSelectedUsers = (selecteds) => {
    const userVerify = selecteds.every((t) => t.id === user.id);
    
    try {
      if (user.profile === 'admin' || user.profile === 'supervisor') {
        const users = selecteds.map((t) => t.id);
        setUserIds(users);
      } else if (!userVerify) {
        toastError('Você não tem permissão para filtrar tickets de outros usuários');
        setUserIds([]);
      } else if (userVerify && user.profile === 'user') {
        setUserIds([user.id]);
      }
    } catch (error) {
      toastError(error);
    }
  };

  // Other filter handlers
  const handleSelectedWhatsapps = (selecteds) => {
    const whatsapp = selecteds.map((t) => t.id);
    setSelectedWhatsapp(whatsapp);
  };

  const handleSelectedStatus = (selecteds) => {
    const statusFilter = selecteds.map((t) => t.status);
    setSelectedStatus(statusFilter);
  };

  // Reset filters
  const resetFilters = () => {
    setCurrentContact(initialContact);
    setSelectedWhatsapp([]);
    setSelectedStatus([]);
    setQueueIds([]);
    setTicketId('');
    setUserIds(user?.profile === 'user' ? [user.id] : []);
    setDateFrom(moment().subtract(7, 'days').format("YYYY-MM-DD"));
    setDateTo(moment().format("YYYY-MM-DD"));
    setSearchParam("");
    handleFilter(1);
  };

  return (
    <div className={classes.root}>
      <MainContainer>
        <div className={classes.header}>
          <div className={classes.titleContainer}>
            <StatsIcon className={classes.titleIcon} fontSize="large" />
            <Typography variant="h4" component="h1" color="textPrimary">
              Relatórios de Atendimento
            </Typography>
          </div>
          <div>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FilterIcon />}
              onClick={() => handleFilter(1)}
              className={classes.filterButton}
            >
              Aplicar Filtros
            </Button>
            <Button
              variant="contained"
              startIcon={<ExportIcon />}
              onClick={exportToExcel}
              className={classes.exportButton}
              disabled={loading}
            >
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <Grid container spacing={3} className={classes.statsCard}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Total de Tickets
                    </Typography>
                    <Typography variant="h4">{stats.total}</Typography>
                  </div>
                  <Avatar style={{ backgroundColor: '#2196f3', color: '#fff' }}>
                    <StatsIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Abertos
                    </Typography>
                    <Typography variant="h4" style={{ color: '#2196f3' }}>{stats.open}</Typography>
                  </div>
                  <Avatar style={{ backgroundColor: '#e3f2fd', color: '#2196f3' }}>
                    <CheckCircleIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Pendentes
                    </Typography>
                    <Typography variant="h4" style={{ color: '#ff9800' }}>{stats.pending}</Typography>
                  </div>
                  <Avatar style={{ backgroundColor: '#fff8e1', color: '#ff9800' }}>
                    <PendingIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <div>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      Fechados
                    </Typography>
                    <Typography variant="h4" style={{ color: '#4caf50' }}>{stats.closed}</Typography>
                  </div>
                  <Avatar style={{ backgroundColor: '#e8f5e9', color: '#4caf50' }}>
                    <CancelIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Filters */}
        <Box mb={3} display="flex">
          <Typography variant="subtitle1" style={{ marginRight: 16, alignSelf: 'center' }}>
            Período rápido:
          </Typography>
          <Button
            variant="outlined"
            onClick={() => applyQuickFilter(1)}
            className={classes.quickFilter}
          >
            Hoje
          </Button>
          <Button
            variant="outlined"
            onClick={() => applyQuickFilter(7)}
            className={classes.quickFilter}
          >
            7 Dias
          </Button>
          <Button
            variant="outlined"
            onClick={() => applyQuickFilter(30)}
            className={classes.quickFilter}
          >
            30 Dias
          </Button>
          <Button
            variant="outlined"
            onClick={resetFilters}
            className={classes.quickFilter}
            startIcon={<RefreshIcon />}
          >
            Limpar Filtros
          </Button>
        </Box>

        {/* Filter Card */}
        <Card className={classes.filterCard}>
          <CardHeader
            title="Filtros Avançados"
            className={classes.filterCardHeader}
            titleTypographyProps={{ variant: 'h6' }}
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl variant="outlined" fullWidth>
                  <Autocomplete
                    fullWidth
                    value={currentContact}
                    options={contacts}
                    onChange={(e, contact) => {
                      setCurrentContact(contact ? contact : initialContact);
                    }}
                    getOptionLabel={(option) => option.name}
                    getOptionSelected={(option, value) => value.id === option.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Contato"
                        placeholder="Selecione um contato"
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <WhatsappsFilter onFiltered={handleSelectedWhatsapps} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatusFilter onFiltered={handleSelectedStatus} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <UsersFilter onFiltered={handleSelectedUsers} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QueueSelectCustom
                  selectedQueueIds={queueIds}
                  onChange={values => setQueueIds(values)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Ticket ID"
                  type="number"
                  value={ticketId}
                  variant="outlined"
                  fullWidth
                  onChange={(e) => {
                    // Aceita apenas números
                    const value = e.target.value.replace(/\D/g, '');
                    setTicketId(value);
                  }}
                  inputProps={{
                    min: 1
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Data Inicial"
                  type="date"
                  value={dateFrom}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Data Final"
                  type="date"
                  value={dateTo}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className={classes.tableCard}>
          <div className={classes.tableContainer}>
            <Table stickyHeader size="small" id="grid-attendants">
              <TableHead className={classes.tableHead}>
                <TableRow>
                  <TableCell align="center">ID</TableCell>
                  <TableCell align="left">Canal</TableCell>
                  <TableCell align="left">Contato</TableCell>
                  <TableCell align="left">Atendente</TableCell>
                  <TableCell align="left">Fila</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="left">Última Mensagem</TableCell>
                  <TableCell align="center">Abertura</TableCell>
                  <TableCell align="center">Fechamento</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <CircularProgress />
                      <Typography variant="body2" style={{ marginTop: 16 }}>
                        Carregando dados...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography variant="body2" color="textSecondary">
                        Nenhum ticket encontrado com os filtros aplicados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id} hover className={classes.highlightRow}>
                      <TableCell align="center">
                        <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                          #{ticket.id}
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        <Box display="flex" alignItems="center">
                          <ChannelIcon channel={ticket.whatsappType} />
                          <Box ml={1}>
                            {ticket.whatsappName}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="left">
                        <Typography variant="body2" style={{ fontWeight: '500' }}>
                          {ticket.contactName}
                        </Typography>
                        {ticket.contactNumber && (
                          <Typography variant="caption" color="textSecondary">
                            {ticket.contactNumber}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="left">
                        {ticket.userName || 'Não atribuído'}
                      </TableCell>
                      <TableCell align="left">
                        <QueueBadge 
                          queueName={ticket.queueName} 
                          queueColor={ticket.queueColor} 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell align="left">
                        <Typography 
                          variant="body2" 
                          noWrap 
                          style={{ maxWidth: 200 }}
                          title={ticket.lastMessage}
                        >
                          {ticket.lastMessage || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {moment(ticket.createdAt).format('DD/MM/YY HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {ticket.closedAt ? moment(ticket.closedAt).format('DD/MM/YY HH:mm') : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Visualizar Ticket">
                          <IconButton
                            onClick={() => history.push(`/tickets/${ticket.uuid}`)}
                            className={classes.actionButton}
                            size="small"
                          >
                            <ArrowForwardIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className={classes.paginationContainer}>
            <Typography variant="body2" color="textSecondary">
              Exibindo {tickets.length} de {totalTickets} resultados
            </Typography>
            <Box display="flex" alignItems="center">
              <FormControl variant="outlined" size="small" style={{ marginRight: 16, minWidth: 120 }}>
                <InputLabel>Itens por página</InputLabel>
                <Select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(e.target.value);
                    handleFilter(1);
                  }}
                  label="Itens por página"
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
              <Pagination
                count={Math.ceil(totalTickets / pageSize)}
                page={pageNumber}
                onChange={(event, value) => handleFilter(value)}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Box>
          </div>
        </Card>
      </MainContainer>
    </div>
  );
};

export default Relatorios;