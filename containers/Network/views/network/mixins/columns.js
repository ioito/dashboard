import _ from 'lodash'
import { mapGetters } from 'vuex'
import {
  getProjectTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  // getNameDescriptionTableColumn,
  getAccountTableColumn,
  getPublicScopeTableColumn,
  getTagTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      {
        field: 'name',
        title: i18n.t('network.text_21'),
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }, h) => {
            const ret = []
            ret.push(h('list-body-cell-wrap', {
              props: {
                copy: true,
                edit: this.isPower(row),
                row,
                hideField: true,
                onManager: this.onManager,
              },
              scopedSlots: {
                default: () => { return (<side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>) },
              },
            }))
            ret.push(h('list-body-cell-wrap', {
              props: {
                edit: this.isPower(row),
                field: 'description',
                row,
                onManager: this.onManager,
              },
            }))
            return ret
          },
        },
        hidden: () => this.$isScopedPolicyMenuHidden('network_hidden_columns.name'),
      },
      getStatusTableColumn({
        statusModule: 'network',
        vm: this,
        hidden: () => this.$isScopedPolicyMenuHidden('network_hidden_columns.status'),
      }),
      getTagTableColumn({
        onManager: this.onManager,
        resource: 'networks',
        columns: () => this.columns,
        editCheck: (row) => (row.provider || '').toLowerCase() !== 'bingocloud',
        hidden: () => this.$isScopedPolicyMenuHidden('network_hidden_columns.metadata'),
      }),
      {
        field: 'server_type',
        title: i18n.t('network.text_249'),
        width: 100,
        formatter: ({ cellValue }) => {
          return this.$t('networkServerType')[cellValue] || i18n.t('network.text_507')
        },
        hidden: () => this.$isScopedPolicyMenuHidden('network_hidden_columns.server_type'),
      },
      getStatusTableColumn({
        field: 'is_auto_alloc',
        statusModule: 'networIsAutoAlloc',
        title: i18n.t('common_498'),
        minWidth: 140,
        hidden: () => this.$isScopedPolicyMenuHidden('network_hidden_columns.is_auto_alloc'),
      }),
      {
        field: 'ip',
        title: i18n.t('network.text_213'),
        width: 160,
        slots: {
          default: ({ row }) => {
            return [
              <div>{ this.$t('network.text_725', [row.guest_ip_start])}</div>,
              <div>{ this.$t('network.text_726', [row.guest_ip_end])}</div>,
            ]
          },
        },
        hidden: () => this.$isScopedPolicyMenuHidden('network_hidden_columns.ip'),
      },
      {
        field: 'ports',
        title: i18n.t('network.text_622'),
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.ports) return [<data-loading />]
            return [
              <div class='text-truncate'>{ this.$t('network.text_727', [row.ports])}</div>,
              <div class='text-truncate'>{ this.$t('network.text_728', [row.ports_used])}</div>,
            ]
          },
        },
        hidden: () => this.$isScopedPolicyMenuHidden('network_hidden_columns.ports'),
      },
      getCopyWithContentTableColumn({
        field: 'vpc',
        title: 'VPC',
        hidden: () => this.$store.getters.isProjectMode || this.hiddenColumns.includes('vpc') || this.$isScopedPolicyMenuHidden('network_hidden_columns.vpc'),
      }),
      getCopyWithContentTableColumn({
        field: 'wire',
        title: i18n.t('network.text_571'),
        hidden: () => this.hiddenColumns.includes('wire') || this.$isScopedPolicyMenuHidden('network_hidden_columns.wire'),
      }),
      {
        field: 'vlan_id',
        title: 'VLAN',
        width: 60,
        hidden: () => this.$isScopedPolicyMenuHidden('network_hidden_columns.vlan_id'),
      },
      {
        field: 'schedtag',
        title: i18n.t('network.text_630'),
        width: 120,
        type: 'expand',
        slots: {
          content: ({ row }) => {
            const tags = _.sortBy(row.schedtags, ['default', 'name'])
            if (tags.length > 0) {
              return tags.map(tag => <a-tag class='mb-2' color='blue'>{tag.name}</a-tag>)
            }
            return [
              <div class='text-color-help'>{ this.$t('network.text_729') }</div>,
            ]
          },
        },
        hidden: () => this.$isScopedPolicyMenuHidden('network_hidden_columns.schedtag'),
      },
      getBrandTableColumn({
        hidden: () => this.hiddenColumns.includes('brand') || this.$isScopedPolicyMenuHidden('network_hidden_columns.brand'),
      }),
      getAccountTableColumn({
        hidden: () => this.hiddenColumns.includes('account') || this.$isScopedPolicyMenuHidden('network_hidden_columns.account'),
      }),
      getPublicScopeTableColumn({
        vm: this,
        resource: 'networks',
        hidden: () => this.$isScopedPolicyMenuHidden('network_hidden_columns.public_scope'),
      }),
      getProjectTableColumn({
        hidden: () => this.hiddenColumns.includes('tenant') || this.$isScopedPolicyMenuHidden('network_hidden_columns.tenant'),
      }),
      getRegionTableColumn({
        hidden: () => this.hiddenColumns.includes('region') || this.$isScopedPolicyMenuHidden('network_hidden_columns.region'),
        vm: this,
      }),
      getTimeTableColumn({
        hidden: () => this.$isScopedPolicyMenuHidden('network_hidden_columns.created_at'),
      }),
    ]
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  methods: {
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
